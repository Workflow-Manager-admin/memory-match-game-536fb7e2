import React, { useEffect, useState } from "react";
import "./App.css";

// Card emoji options (use simple emojis for visual match and minimalism)
const CARD_EMOJIS = [
  "🍎", "🚗", "🐶", "⚽", "🎵", "🌟", "🍕", "👑"
];

/**
 * Generate an array of shuffled card objects (each has { id, emoji, isFlipped, isMatched })
 * @returns {Array}
 */
function generateShuffledDeck() {
  // Double array and assign object props plus unique id
  const duplicated = [...CARD_EMOJIS, ...CARD_EMOJIS]
    .map((emoji, i) => ({
      id: i + "-" + Math.random().toString(16).slice(2, 8),
      emoji,
      isFlipped: false,
      isMatched: false,
    }));
  // Fisher-Yates shuffle
  for (let i = duplicated.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [duplicated[i], duplicated[j]] = [duplicated[j], duplicated[i]];
  }
  return duplicated;
}

/**
 * PUBLIC_INTERFACE
 * Memory Match Game main App component
 */
function App() {
  // State
  const [deck, setDeck] = useState(generateShuffledDeck());
  const [flipped, setFlipped] = useState([]); // Indices of currently flipped cards (max 2)
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [isBusy, setIsBusy] = useState(false); // Disable flips while waiting for unflip
  const [theme, setTheme] = useState("light");

  // Effect: Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  // PUBLIC_INTERFACE
  function resetGame() {
    setDeck(generateShuffledDeck());
    setFlipped([]);
    setMoves(0);
    setMatchedCount(0);
    setIsBusy(false);
  }

  // Handle card flip (only if card not yet matched/flipped and not busy)
  function handleCardClick(idx) {
    if (isBusy || deck[idx].isMatched || deck[idx].isFlipped) return;
    let newDeck = deck.slice();
    newDeck[idx] = { ...newDeck[idx], isFlipped: true };
    let newFlipped = [...flipped, idx];

    setDeck(newDeck);

    if (newFlipped.length === 2) {
      setIsBusy(true);
      setMoves((m) => m + 1);
      // Check match after short delay (for animation)
      setTimeout(() => {
        const [i1, i2] = newFlipped;
        if (newDeck[i1].emoji === newDeck[i2].emoji) {
          // It's a match
          newDeck[i1].isMatched = true;
          newDeck[i2].isMatched = true;
          setDeck(newDeck);
          setMatchedCount((mc) => mc + 1);
        } else {
          // Not a match, unflip
          newDeck[i1].isFlipped = false;
          newDeck[i2].isFlipped = false;
          setDeck(newDeck);
        }
        setFlipped([]);
        setIsBusy(false);
      }, 850);
    } else {
      setFlipped(newFlipped);
    }
  }

  // Game won?
  const isGameWon = matchedCount === CARD_EMOJIS.length;

  return (
    <div className="App">
      <header className="App-header">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
        <h1 style={{ letterSpacing: "2px", color: "var(--text-primary)" }}>
          Memory Match Game
        </h1>
        <div
          style={{
            margin: "0.8em 0 1.4em 0",
            color: "var(--text-secondary)",
            fontWeight: 500,
          }}
        >
          {isGameWon ? (
            <span>🎉 You Win! Moves: <b>{moves}</b></span>
          ) : (
            <span>
              Moves: <b>{moves}</b> &nbsp;•&nbsp; Matches: <b>{matchedCount}</b>/{CARD_EMOJIS.length}
            </span>
          )}
        </div>
        <div style={{ marginBottom: "1.5em" }}>
          <button
            className="game-btn"
            onClick={resetGame}
            style={{
              padding: "0.6em 1.8em",
              fontSize: "1.06em",
              borderRadius: "8px",
              background: "var(--button-bg)",
              color: "var(--button-text)",
              border: "none",
              fontWeight: 700,
              letterSpacing: "1px",
              boxShadow: "0 1px 8px 1px #0001",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            {isGameWon ? "Play Again" : "Reset"}
          </button>
        </div>
        {/* Centered game grid */}
        <div className="memory-grid-wrapper">
          <div className="memory-grid">
            {deck.map((card, idx) => (
              <Card
                key={card.id}
                emoji={card.emoji}
                isFlipped={card.isFlipped || card.isMatched}
                isMatched={card.isMatched}
                onClick={() => handleCardClick(idx)}
                disabled={isBusy || card.isFlipped || card.isMatched || flipped.length === 2}
              />
            ))}
          </div>
        </div>
      </header>
    </div>
  );
}

/**
 * Card component with flip animation and minimal style.
 * @param {*} param0
 * @returns
 */
function Card({ emoji, isFlipped, isMatched, onClick, disabled }) {
  return (
    <button
      className={`memory-card${isFlipped ? " flipped" : ""}${isMatched ? " matched" : ""}`}
      style={{}}
      onClick={onClick}
      disabled={disabled}
      aria-label={isFlipped ? emoji : "Hidden card"}
      tabIndex={disabled ? -1 : 0}
    >
      <div className="card-inner">
        <div className="card-front" />
        <div className="card-back">{emoji}</div>
      </div>
    </button>
  );
}

export default App;
