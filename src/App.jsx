import React, { useEffect, useMemo, useRef, useState } from "react";

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

const REASONS_DEFAULT = [
  "You make me love you more everyday my Nelu.",
  "Your heart is with me here in SL.",
  "We’d be the best valentine couple.",
  "You’re my favorite person in the whole world.",
  "You’re kind, funny, and chaos-in-a-good-way.",
];

function HeartField({ burst = 0 }) {
  const [hearts, setHearts] = useState([]);
  const idRef = useRef(0);

  // initial floating hearts
  useEffect(() => {
    const initial = Array.from({ length: 20 }, () => makeHeart());
    setHearts(initial);

    const interval = setInterval(() => {
      setHearts((prev) => {
        // keep a manageable amount
        const next = prev.filter((h) => h.y < 120);
        // add a new heart occasionally
        if (Math.random() < 0.35) next.push(makeHeart());
        return next;
      });
    }, 650);

    return () => clearInterval(interval);

    function makeHeart() {
      const id = idRef.current++;
      return {
        id,
        x: rand(0, 100),
        y: rand(105, 135),
        size: rand(14, 34),
        drift: rand(-10, 10),
        duration: rand(7, 13),
        opacity: rand(0.35, 0.85),
        hue: rand(330, 10), // wrap-ish pink/red range
      };
    }
  }, []);

  // burst hearts on "Yes"
  useEffect(() => {
    if (!burst) return;
    const burstHearts = Array.from({ length: 18 }, () => ({
      id: idRef.current++,
      x: 50 + rand(-10, 10),
      y: 65 + rand(-5, 10),
      size: rand(16, 40),
      drift: rand(-35, 35),
      duration: rand(2.8, 4.2),
      opacity: rand(0.6, 1),
      hue: rand(330, 10),
      burst: true,
    }));

    setHearts((prev) => [...prev, ...burstHearts]);
    // cleanup burst after animation
    const t = setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !h.burst));
    }, 4500);

    return () => clearTimeout(t);
  }, [burst]);

  return (
    <div className="hearts" aria-hidden="true">
      {hearts.map((h) => (
        <span
          key={h.id}
          className={`heart ${h.burst ? "burst" : ""}`}
          style={{
            left: `${h.x}%`,
            bottom: `${h.y - 100}%`,
            fontSize: `${h.size}px`,
            "--drift": `${h.drift}px`,
            "--dur": `${h.duration}s`,
            opacity: h.opacity,
            filter: `hue-rotate(${h.hue}deg)`,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}

export default function App() {
  const [accepted, setAccepted] = useState(false);
  const [burst, setBurst] = useState(0);
  const [reasonIndex, setReasonIndex] = useState(0);

  const reasons = useMemo(() => REASONS_DEFAULT, []);

  // "No" button position (relative to the card)
  const cardRef = useRef(null);
  const noRef = useRef(null);
  const [noPos, setNoPos] = useState({ x: 60, y: 76 }); // % within card
  const [noScale, setNoScale] = useState(1);

  const question = "Will you be my Valentine?";
  const subtitle = "Here's your valentine invitation baba 😄";

  function onYes() {
    setAccepted(true);
    setBurst((b) => b + 1);
  }

  function dodge() {
    const card = cardRef.current;
    if (!card) return;

    // Move within safe bounds
    const newX = rand(10, 86);
    const newY = rand(60, 88);
    setNoPos({ x: newX, y: newY });

    // Make "No" slightly smaller each dodge (optional, playful)
    setNoScale((s) => clamp(s - 0.06, 0.68, 1));
  }

  function nextReason() {
    setReasonIndex((i) => (i + 1) % reasons.length);
  }

  function prevReason() {
    setReasonIndex((i) => (i - 1 + reasons.length) % reasons.length);
  }

  return (
    <div className="page">
      <HeartField burst={burst} />

      <div className="wrap">
        <div className="card" ref={cardRef}>
          <div className="badge">💌 Valentine App</div>

          <h1 className="title">{question}</h1>
          <p className="subtitle">{subtitle}</p>

          <div className="reasonBox">
            <div className="reasonHeader">
              <span className="reasonLabel">A few reasons:</span>
              <span className="reasonCount">
                {reasonIndex + 1}/{reasons.length}
              </span>
            </div>

            <div className="reasonText">“{reasons[reasonIndex]}”</div>

            <div className="reasonControls">
              <button className="ghost" onClick={prevReason} type="button">
                ←
              </button>
              <button className="ghost" onClick={nextReason} type="button">
                →
              </button>
            </div>
          </div>

          <div className="buttons">
            <button className="yes" onClick={onYes} type="button">
              Yes 💖
            </button>

            {/* The "No" button is positioned absolutely so it can dodge */}
            <button
              ref={noRef}
              className="no"
              type="button"
              onMouseEnter={dodge}
              onMouseDown={dodge}
              onTouchStart={dodge}
              style={{
                left: `${noPos.x}%`,
                top: `${noPos.y}%`,
                transform: `translate(-50%, -50%) scale(${noScale})`,
              }}
              aria-label="No (tries to run away)"
            >
              No 😅
            </button>
          </div>

          <p className="hint">
            Tip: Try to click “No”. (Good luck.)
          </p>
        </div>
      </div>

      {accepted && (
        <div className="overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="big">🎉</div>
            <h2 className="modalTitle">YAY!</h2>
            <p className="modalText">
              You just made this app’s entire week.
            </p>
            <div className="modalActions">
              <button
                className="yes"
                type="button"
                onClick={() => setBurst((b) => b + 1)}
              >
                More hearts
              </button>
              <button
                className="ghost"
                type="button"
                onClick={() => setAccepted(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{css}</style>
    </div>
  );
}

const css = `
  :root{
    --bg1: #0b1020;
    --bg2: #180a1d;
    --card: rgba(255,255,255,0.08);
    --card2: rgba(255,255,255,0.12);
    --text: rgba(255,255,255,0.92);
    --muted: rgba(255,255,255,0.72);
    --shadow: 0 20px 60px rgba(0,0,0,0.45);
    --pink: #ff4da6;
    --pink2: #ff77c7;
    --line: rgba(255,255,255,0.14);
  }

  *{ box-sizing: border-box; }
  html, body{ height:100%; }
  body{
    margin:0;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
    color: var(--text);
    background: radial-gradient(1200px 700px at 20% 10%, #2a1240 0%, transparent 60%),
                radial-gradient(900px 700px at 85% 35%, #3a0f2b 0%, transparent 55%),
                linear-gradient(135deg, var(--bg1), var(--bg2));
    overflow:hidden;
  }

  .page{ position:relative; min-height:100vh; }

  .wrap{
    min-height:100vh;
    display:grid;
    place-items:center;
    padding: 22px;
    position:relative;
    z-index: 2;
  }

  .card{
    width: min(520px, 92vw);
    padding: 24px 22px 18px;
    border-radius: 22px;
    background: linear-gradient(180deg, var(--card), rgba(255,255,255,0.03));
    border: 1px solid var(--line);
    box-shadow: var(--shadow);
    backdrop-filter: blur(10px);
    position:relative;
    overflow:hidden;
  }

  .card::before{
    content:"";
    position:absolute;
    inset:-120px -60px auto auto;
    width: 240px;
    height: 240px;
    background: radial-gradient(circle at 30% 30%, rgba(255,77,166,0.35), transparent 55%);
    transform: rotate(18deg);
    pointer-events:none;
  }

  .badge{
    display:inline-flex;
    gap:10px;
    align-items:center;
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    padding: 8px 12px;
    border-radius: 999px;
  }

  .title{
    margin: 16px 0 6px;
    font-size: 34px;
    line-height: 1.08;
  }

  .subtitle{
    margin: 0 0 16px;
    color: var(--muted);
    line-height: 1.45;
  }

  .reasonBox{
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.14);
    background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03));
    padding: 14px 14px 12px;
    margin: 14px 0 18px;
  }

  .reasonHeader{
    display:flex;
    justify-content: space-between;
    align-items:center;
    color: var(--muted);
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .reasonText{
    margin-top: 10px;
    font-size: 16px;
    line-height: 1.5;
  }

  .reasonControls{
    display:flex;
    gap:10px;
    margin-top: 12px;
  }

  .buttons{
    position:relative;
    height: 92px;
    border-top: 1px dashed rgba(255,255,255,0.18);
    padding-top: 16px;
    margin-top: 14px;
  }

  button{
    border: 0;
    cursor: pointer;
    font-weight: 650;
    border-radius: 14px;
    transition: transform .12s ease, filter .12s ease, background .12s ease;
    user-select:none;
  }

  button:active{
    transform: translateY(1px) scale(0.99);
  }

  .yes{
    padding: 12px 16px;
    background: linear-gradient(135deg, var(--pink), var(--pink2));
    color: #1b0a12;
    box-shadow: 0 10px 25px rgba(255,77,166,0.25);
  }

  .yes:hover{ filter: brightness(1.05); }

  .ghost{
    padding: 10px 14px;
    background: rgba(255,255,255,0.07);
    color: var(--text);
    border: 1px solid rgba(255,255,255,0.14);
  }

  .ghost:hover{ background: rgba(255,255,255,0.10); }

  .no{
    position:absolute;
    padding: 11px 14px;
    background: rgba(255,255,255,0.08);
    color: var(--text);
    border: 1px solid rgba(255,255,255,0.16);
    box-shadow: 0 12px 25px rgba(0,0,0,0.30);
    will-change: left, top, transform;
    transition: left .18s ease, top .18s ease, transform .18s ease;
  }

  .no:hover{ background: rgba(255,255,255,0.11); }

  .hint{
    margin: 14px 4px 0;
    font-size: 12.5px;
    color: rgba(255,255,255,0.62);
  }

  /* Floating hearts */
  .hearts{
    position:absolute;
    inset: 0;
    overflow:hidden;
    z-index: 1;
    pointer-events:none;
  }

  .heart{
    position:absolute;
    color: rgba(255, 110, 190, 0.85);
    animation: floatUp var(--dur) linear infinite;
    transform: translateX(0);
    text-shadow: 0 10px 30px rgba(255,77,166,0.22);
  }

  .heart.burst{
    animation: burstUp var(--dur) ease-out forwards;
  }

  @keyframes floatUp{
    0%   { transform: translateX(0) translateY(0); }
    100% { transform: translateX(var(--drift)) translateY(-140vh); }
  }

  @keyframes burstUp{
    0%   { transform: translateX(0) translateY(0) scale(1); opacity: 1; }
    100% { transform: translateX(var(--drift)) translateY(-55vh) scale(0.9); opacity: 0; }
  }

  /* Overlay modal */
  .overlay{
    position:fixed;
    inset:0;
    background: rgba(0,0,0,0.55);
    display:grid;
    place-items:center;
    padding: 22px;
    z-index: 10;
  }

  .modal{
    width: min(440px, 92vw);
    border-radius: 22px;
    background: linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06));
    border: 1px solid rgba(255,255,255,0.16);
    box-shadow: var(--shadow);
    backdrop-filter: blur(10px);
    padding: 20px 18px 16px;
    text-align:center;
  }

  .big{ font-size: 44px; }
  .modalTitle{ margin: 6px 0 6px; font-size: 26px; }
  .modalText{ margin: 0 0 14px; color: var(--muted); line-height: 1.45; }

  .modalActions{
    display:flex;
    justify-content:center;
    gap: 10px;
    margin-top: 10px;
  }
`;



