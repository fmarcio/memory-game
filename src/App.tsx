import { useEffect, useState } from "react";
import { SingleCard } from "./components/SingleCard";
import "./App.css";

type Card = {
  id: number;
  matched: boolean;
  src: string;
};

// Creating the arr of images outside the component because this will not change.
// Also, putting outside avoids this arr been re-created every time the component is re-rendered
const cardImages = [
  { matched: false, src: "/img/helmet-1.png" },
  { matched: false, src: "/img/potion-1.png" },
  { matched: false, src: "/img/ring-1.png" },
  { matched: false, src: "/img/scroll-1.png" },
  { matched: false, src: "/img/shield-1.png" },
  { matched: false, src: "/img/sword-1.png" },
];

export const App: React.FC = () => {
  const [cards, setCards] = useState<Array<Card>>([]);
  const [choiceOne, setChoiceOne] = useState<any>(null);
  const [choiceTwo, setChoiceTwo] = useState<any>(null);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [turns, setTurns] = useState<number>(0);

  // This function will do 3 things: 1-duplicate cardImgages using spread, shuffle it with .sort() and add an id with .map()
  const shuffleCards = (): void => {
    const shuffledCards = [...cardImages, ...cardImages]
      // If the substraction results in a negative number, cards won't change its positions. I  If it's positive, it will change.
      .sort(() => Math.random() - 0.5)
      .map((card) => ({ ...card, id: Math.random() }));

    setChoiceOne(null);
    setChoiceTwo(null);
    setCards(shuffledCards);
    setTurns(0);
  };

  const handleChoice = (card: Card) => {
    choiceOne ? setChoiceTwo(card) : setChoiceOne(card);
  };

  const resetTurn = (): void => {
    setChoiceOne(null);
    setChoiceTwo(null);
    setTurns((prevTurns) => prevTurns + 1);
    setDisabled(false);
  };

  // Starts a new game when component loads
  useEffect(() => {
    shuffleCards();
  }, []);

  useEffect(() => {
    if (choiceOne && choiceTwo) {
      setDisabled(true);

      // If the cards are equal, change "matched" to be true
      if (choiceOne.src === choiceTwo.src) {
        setCards((prevCards) =>
          prevCards.map((card) => {
            if (card.src === choiceOne.src) {
              return { ...card, matched: true };
            } else {
              return card;
            }
          })
        );
      }
      // Add a delay to see better the unmatched cards in the UI
      setTimeout(() => resetTurn(), 1000);
    }
  }, [choiceOne, choiceTwo]);

  const isGameCompleted = (): boolean => {
    return cards.every((card) => card.matched);
  };

  return (
    <div className="App">
      <h1>Magic Match</h1>
      <button onClick={() => shuffleCards()}>New Game</button>

      <div className="card-grid">
        {cards.map((card) => (
          <SingleCard
            card={card}
            disabled={disabled}
            flipped={card === choiceOne || card === choiceTwo || card.matched}
            handleChoice={handleChoice}
            key={card.id}
          />
        ))}
      </div>
      <p>Turns: {turns}</p>
      {isGameCompleted() && (
        <>
          <h2>Game Completed!</h2>
          <p>
            You've finished the game in{" "}
            <span style={{ color: "#f5f242" }}>{turns}</span> turns!
          </p>
          <button onClick={() => shuffleCards()}>Play again</button>
        </>
      )}
    </div>
  );
};
