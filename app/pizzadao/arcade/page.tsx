'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

type Rect = { left: number; top: number; width: number; height: number };
type Layout = { screen: Rect; button: Rect; joystick: Rect };

const GAME_OPTIONS = [
  {
    name: 'Bitcoin Pizza Blastoff',
    subtitle: 'Orbit Run',
    thumbnail: 'https://c-r-x-s-s.github.io/Bitcoin-Pizza-Blastoff/Assets/Visual/logo.png',
    link: 'https://c-r-x-s-s.github.io/Bitcoin-Pizza-Blastoff/'
  },
  {
    name: 'Pizza Chef',
    subtitle: 'Kitchen Rush',
    thumbnail: '/pizzadao/pizza-chef-thumb.jpg',
    link: 'https://pizzachef.bolt.host/'
  },
  {
    name: 'Pizza Flight Simulator',
    subtitle: 'Space Shooter',
    thumbnail: 'https://judgeartist.com/wp-content/uploads/2021/05/PizzaBox.jpg',
    link: 'https://judgeartist.com/portfolio-items/pizza-flight-simulator/?portfolioCats=22'
  },
  {
    name: "Molto Benny's Delivery Route",
    subtitle: 'Delivery Dash',
    thumbnail:
      'https://images.squarespace-cdn.com/content/v1/6462e2c2553b2d3fc022842f/d9c2a6aa-8949-4d23-a9d7-757a2d87e62e/Global_PizzaParty_Animate-ONLY_950.gif?format=750w',
    link: 'https://pizzadao.github.io/moltobennydelivery/'
  },
  {
    name: 'Pizza Personality Quiz Game',
    subtitle: 'Quiz Challenge',
    thumbnail: '/pizzadao/pizza-quiz-thumb.jpg',
    link: 'https://pizzaquiz.bolt.host/'
  },
  {
    name: 'Picky Pizza',
    subtitle: 'Topping Builder',
    thumbnail: 'https://pizzadao.github.io/picky_pizza/images/pizza-base.png',
    link: 'https://pizzadao.github.io/picky_pizza/'
  }
];

const BASE_PATH = process.env.NODE_ENV === 'production' ? '/PizzaDAO-Arcade' : '';
const withBase = (src: string) => (src.startsWith('/') ? `${BASE_PATH}${src}` : src);

const LOCKED_LAYOUT: Layout = {
  screen: {
    left: 37.78333333333333,
    top: 19.949902305588118,
    width: 24.883333333333333,
    height: 30.971629542790154
  },
  button: {
    left: 52.96666666666666,
    top: 52.52289957014459,
    width: 8.2,
    height: 4.574755763970301
  },
  joystick: {
    left: 48.916666666666664,
    top: 49.92153184837827,
    width: 3.4,
    height: 10.5
  }
};

export default function PizzaDaoArcadePage() {
  const [zooming, setZooming] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [layout] = useState<Layout>(LOCKED_LAYOUT);

  useEffect(() => {
    if (!zooming) return;
    const timer = setTimeout(() => setShowMenu(true), 900);
    return () => clearTimeout(timer);
  }, [zooming]);

  function onEnter() {
    if (zooming) return;
    setZooming(true);
  }

  const screenStyle = {
    left: `${layout.screen.left}%`,
    top: `${layout.screen.top}%`,
    width: `${layout.screen.width}%`,
    height: `${layout.screen.height}%`
  };

  const buttonStyle = {
    left: `${layout.button.left}%`,
    top: `${layout.button.top}%`,
    width: `${layout.button.width}%`,
    height: `${layout.button.height}%`
  };

  const joystickStyle = {
    left: `${layout.joystick.left}%`,
    top: `${layout.joystick.top}%`,
    width: `${layout.joystick.width * 0.5}%`,
    height: `${layout.joystick.height * 0.5}%`
  };

  return (
    <div className={styles.page}>
      <div className={`${styles.scene} ${zooming ? styles.crashZoom : ''}`} aria-hidden={showMenu}>
        <img
          src={withBase('/pizzadao/arcade-visual.jpg')}
          alt="PizzaDAO arcade"
          className={styles.background}
        />

        <div className={styles.gifScreen} style={screenStyle}>
          <video
            className={styles.screenVideo}
            src={withBase('/pizzadao/arcade-screen.mp4')}
            autoPlay
            loop
            muted
            playsInline
          />
        </div>

        <div className={styles.joystickOverlay} style={joystickStyle} aria-hidden>
          <span className={styles.joystickStem} />
          <span className={styles.joystickKnob} />
        </div>

        <button className={styles.enterButton} style={buttonStyle} onClick={onEnter}>
          Enter
        </button>
      </div>

      {showMenu ? (
        <div className={styles.menuWrap}>
          <div className={styles.menuCard}>
            <div className={styles.menuHeader}>
              <img
                src={withBase('/pizzadao/arcade-menu-logo.jpg')}
                alt="PizzaDAO Arcade"
                className={styles.menuLogo}
              />
            </div>
            <div className={styles.menuGrid}>
              {GAME_OPTIONS.map((game) => (
                <a
                  key={game.name}
                  className={styles.gameCard}
                  href={game.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className={styles.gameMeta}>
                    <h3>{game.name}</h3>
                    <p>{game.subtitle}</p>
                    <span className={styles.playBtn}>Play Now</span>
                  </div>
                  <img src={withBase(game.thumbnail)} alt={game.name} className={styles.gameThumb} />
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
