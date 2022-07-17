import React from "react";
import "./SingleCard.css";

interface ISingleCardProps {
  card: Card;
  disabled: boolean;
  flipped: boolean;
  handleChoice: (card: Card) => void;
}

type Card = {
  id: number;
  matched: boolean;
  src: string;
};

export const SingleCard: React.FC<ISingleCardProps> = ({
  card,
  disabled,
  flipped,
  handleChoice,
}) => {
  const handleClick = () => {
    if (!disabled) {
      handleChoice(card);
    }
  };

  return (
    <div className="card">
      <div className={flipped ? "flipped" : ""}>
        <img src={card.src} className="front" alt="card front" />
        <img
          src="/img/cover.png"
          className="back"
          alt="card back"
          onClick={handleClick}
        />
      </div>
    </div>
  );
};
