'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css';

const withBase = (src: string) => src;

const GAME_OPTIONS = [
  { name: 'Bitcoin Pizza Blastoff', subtitle: 'Orbit Run', thumbnail: 'https://c-r-x-s-s.github.io/Bitcoin-Pizza-Blastoff/Assets/Visual/logo.png', link: 'https://c-r-x-s-s.github.io/Bitcoin-Pizza-Blastoff/' },
  { name: 'Pizza Chef', subtitle: 'Kitchen Rush', thumbnail: '/pizzadao/pizza-chef-thumb.jpg', link: 'https://pizzachef.bolt.host/' },
  { name: 'Pizza Flight Simulator', subtitle: 'Space Shooter', thumbnail: 'https://judgeartist.com/wp-content/uploads/2021/05/PizzaBox.jpg', link: 'https://judgeartist.com/portfolio-items/pizza-flight-simulator/?portfolioCats=22' },
  { name: "Molto Benny's Delivery Route", subtitle: 'Delivery Dash', thumbnail: 'https://images.squarespace-cdn.com/content/v1/6462e2c2553b2d3fc022842f/d9c2a6aa-8949-4d23-a9d7-757a2d87e62e/Global_PizzaParty_Animate-ONLY_950.gif?format=750w', link: 'https://pizzadao.github.io/moltobennydelivery/' },
  { name: 'Pizza Personality Quiz Game', subtitle: 'Quiz Challenge', thumbnail: '/pizzadao/pizza-quiz-thumb.jpg', link: 'https://pizzaquiz.bolt.host/' },
  { name: 'Picky Pizza', subtitle: 'Topping Builder', thumbnail: 'https://pizzadao.github.io/picky_pizza/images/pizza-base.png', link: 'https://pizzadao.github.io/picky_pizza/' }
];

/* Locked layout — tuned by Jeff 2026-04-02 */
const L = {
  screen:   { left: 37.7667, top: 19.8999, width: 24.6333, height: 31.5969 },
  joystick: { left: 49.0,    top: 50.3967, width: 1.7,     height: 5.25 },
  button:   { left: 56.0417, top: 59.3428, width: 10.9344, height: 5.7158 },
  pizza:    { left: 76.5688, top: 54.7129, width: 17.4251, height: 9.0285, rx: -47, ry: 1.5, rz: 2 },
  crxss:    { left: 37.4628, top: 89.6998, width: 6.4685,  height: 4.8435, rotate: -28.5 }
};

export default function PizzaDaoArcadePage() {
  const [zooming, setZooming] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const clickSfxRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!zooming) return;
    const timer = setTimeout(() => setShowMenu(true), 900);
    return () => clearTimeout(timer);
  }, [zooming]);

  /* Hide Mission Control shell (sidebar + main padding) so arcade is full-bleed */
  useEffect(() => {
    const sidebar = document.querySelector('.sidebar') as HTMLElement | null;
    const main = document.querySelector('.main') as HTMLElement | null;
    const shell = document.querySelector('.shell') as HTMLElement | null;
    if (sidebar) sidebar.style.display = 'none';
    if (main) { main.style.padding = '0'; main.style.margin = '0'; main.style.maxWidth = 'none'; }
    if (shell) { shell.style.display = 'block'; shell.style.padding = '0'; }
    return () => {
      if (sidebar) sidebar.style.display = '';
      if (main) { main.style.padding = ''; main.style.margin = ''; main.style.maxWidth = ''; }
      if (shell) { shell.style.display = ''; shell.style.padding = ''; }
    };
  }, []);

  useEffect(() => {
    const audio = new Audio(withBase('/pizzadao/start-button-sound.mp3'));
    audio.preload = 'auto';
    clickSfxRef.current = audio;
    return () => { clickSfxRef.current = null; };
  }, []);

  function playClickSfx() {
    const a = clickSfxRef.current;
    if (!a) return;
    try { a.currentTime = 0; void a.play(); } catch {}
  }

  function onEnter() {
    if (zooming) return;
    playClickSfx();
    setZooming(true);
  }

  function onPlayNowClick(e: React.MouseEvent<HTMLAnchorElement>, link: string) {
    e.preventDefault();
    playClickSfx();
    setTimeout(() => { window.open(link, '_blank', 'noopener,noreferrer'); }, 90);
  }

  function onCreditClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    playClickSfx();
    setTimeout(() => { window.open('https://crxss.xyz', '_blank', 'noopener,noreferrer'); }, 90);
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.scene} ${zooming ? styles.crashZoom : ''}`} aria-hidden={showMenu}>
        <img src={withBase("/pizzadao/arcade-visual.jpg?v=20260402-locked")} alt="PizzaDAO arcade" className={styles.background} />

        <div className={styles.gifScreen} style={{ left: `${L.screen.left}%`, top: `${L.screen.top}%`, width: `${L.screen.width}%`, height: `${L.screen.height}%` }}>
          <video className={styles.screenVideo} src={withBase("/pizzadao/arcade-screen.mp4")} autoPlay loop muted playsInline />
        </div>

        <div className={styles.joystickOverlay} style={{ left: `${L.joystick.left}%`, top: `${L.joystick.top}%`, width: `${L.joystick.width}%`, height: `${L.joystick.height}%` }} aria-hidden>
          <span className={styles.joystickStem} />
          <span className={styles.joystickKnob} />
        </div>

        <div className={styles.pizzaOverlay} style={{ left: `${L.pizza.left}%`, top: `${L.pizza.top}%`, width: `${L.pizza.width}%`, height: `${L.pizza.height}%`, transform: `perspective(900px) rotateX(${L.pizza.rx}deg) rotateY(${L.pizza.ry}deg) rotateZ(${L.pizza.rz}deg)`, transformOrigin: '50% 50%' }}>
          <img src={withBase("/pizzadao/stool-pizza-v2.png")} alt="Pizza plate" className={styles.pizzaImage} />
        </div>

        <button className={styles.enterButton} style={{ left: `${L.button.left}%`, top: `${L.button.top}%`, width: `${L.button.width}%`, height: `${L.button.height}%` }} onClick={onEnter} aria-label="Start">
          <img src={withBase("/pizzadao/start-button.png")} alt="Start" className={styles.startButtonImage} />
        </button>

        <a href="https://crxss.xyz" target="_blank" rel="noopener noreferrer" className={styles.crxssHotspot}
          style={{ left: `${L.crxss.left}%`, top: `${L.crxss.top}%`, width: `${L.crxss.width}%`, height: `${L.crxss.height}%`, transform: `rotate(${L.crxss.rotate}deg)` }}
          aria-label="Created by CRXSS" />
      </div>

      {showMenu ? (
        <div className={styles.menuWrap}>
          <div className={styles.menuCard}>
            <div className={styles.menuHeader}>
              <img src={withBase("/pizzadao/arcade-menu-logo.jpg")} alt="PizzaDAO Arcade" className={styles.menuLogo} />
            </div>
            <div className={styles.menuGrid}>
              {GAME_OPTIONS.map((game) => (
                <a key={game.name} className={styles.gameCard} href={game.link} target="_blank" rel="noreferrer" onClick={(e) => onPlayNowClick(e, game.link)}>
                  <div className={styles.gameMeta}>
                    <h3>{game.name}</h3>
                    <p>{game.subtitle}</p>
                    <img src={withBase("/pizzadao/playnow.jpeg")} alt="Play Now" className={styles.playBtnImage} />
                  </div>
                  <img src={withBase(game.thumbnail)} alt={game.name} className={styles.gameThumb} />
                </a>
              ))}
            </div>
            <a href="https://crxss.xyz" target="_blank" rel="noopener noreferrer" className={styles.menuCredit} onClick={onCreditClick}>
              <img src={withBase("/pizzadao/createdbycrxss-8bit.png")} alt="Created by CRXSS" className={styles.menuCreditImg} />
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
