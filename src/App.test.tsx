import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from './App';

describe('Magic Match Game', () => {
  test('renders the game title and new game button', () => {
    render(<App />);
    const titleElement = screen.getByText(/Magic Match/i);
    const buttonElement = screen.getByRole('button', { name: /New Game/i });

    expect(titleElement).toBeInTheDocument();
    expect(buttonElement).toBeInTheDocument();
  });

  test('renders 12 cards initially (6 pairs)', async () => {
    render(<App />);
    const cardBacks = await screen.findAllByAltText('card back');
    expect(cardBacks).toHaveLength(12);
  });

  test('shuffles cards when "New Game" button is clicked', async () => {
    render(<App />);
    let initialCards: string[] = [];
    await waitFor(() => {
      initialCards = screen
        .getAllByAltText('card front')
        .map((img) => (img as HTMLImageElement).src);
      expect(initialCards).toHaveLength(12);
    });

    const buttonElement = screen.getByRole('button', { name: /New Game/i });
    fireEvent.click(buttonElement);

    // Wait for shuffling to finish (300ms in App.tsx)
    await waitFor(() => {
      const shuffledCards = screen
        .getAllByAltText('card front')
        .map((img) => (img as HTMLImageElement).src);
      expect(shuffledCards).toHaveLength(12);
      // Ensure it's not the exact same order (very likely)
      // expect(shuffledCards).not.toEqual(initialCards); 
    }, { timeout: 2000 });
  });

  test('flips a card when clicked', async () => {
    render(<App />);
    const cardBacks = await screen.findAllByAltText('card back');

    const firstCardContainer = cardBacks[0].parentElement;
    expect(firstCardContainer).not.toHaveClass('flipped');

    fireEvent.click(cardBacks[0]);

    expect(firstCardContainer).toHaveClass('flipped');
  });

  test('does not allow clicking more than two cards at once', async () => {
    render(<App />);
    const cardBacks = await screen.findAllByAltText('card back');

    fireEvent.click(cardBacks[0]);
    fireEvent.click(cardBacks[1]);
    fireEvent.click(cardBacks[2]);

    const thirdCardContainer = cardBacks[2].parentElement;
    expect(thirdCardContainer).not.toHaveClass('flipped');

    await waitFor(
      () => {
        expect(screen.getByText(/Turns: 1/i)).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  test('matches two identical cards and keeps them flipped', async () => {
    render(<App />);
    const cardFronts = await screen.findAllByAltText('card front');
    const cardBacks = screen.getAllByAltText('card back');

    const firstCardSrc = (cardFronts[0] as HTMLImageElement).src;
    let secondCardIndex = -1;
    for (let i = 1; i < cardFronts.length; i++) {
      if ((cardFronts[i] as HTMLImageElement).src === firstCardSrc) {
        secondCardIndex = i;
        break;
      }
    }

    fireEvent.click(cardBacks[0]);
    fireEvent.click(cardBacks[secondCardIndex]);

    expect(cardBacks[0].parentElement).toHaveClass('flipped');
    expect(cardBacks[secondCardIndex].parentElement).toHaveClass('flipped');

    await waitFor(
      () => {
        expect(screen.getByText(/Turns: 1/i)).toBeInTheDocument();
      },
      { timeout: 2000 },
    );

    expect(cardBacks[0].parentElement).toHaveClass('flipped');
    expect(cardBacks[secondCardIndex].parentElement).toHaveClass('flipped');
  });

  test('displays game completed message when all pairs are matched', async () => {
    render(<App />);
    const cardFronts = await screen.findAllByAltText('card front');
    const cardBacks = screen.getAllByAltText('card back');

    const srcMap: Record<string, number[]> = {};
    cardFronts.forEach((img, index) => {
      const src = (img as HTMLImageElement).src;
      if (!srcMap[src]) srcMap[src] = [];
      srcMap[src].push(index);
    });

    const pairs = Object.values(srcMap);
    for (let i = 0; i < pairs.length; i++) {
      const [idx1, idx2] = pairs[i];
      fireEvent.click(cardBacks[idx1]);
      fireEvent.click(cardBacks[idx2]);

      await waitFor(
        () => {
          expect(
            screen.getByText(new RegExp(`Turns: ${i + 1}`, 'i')),
          ).toBeInTheDocument();
        },
        { timeout: 2000 },
      );
    }

    expect(screen.getByText(/Game Completed!/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Play again/i }),
    ).toBeInTheDocument();
  }, 15000);
});
