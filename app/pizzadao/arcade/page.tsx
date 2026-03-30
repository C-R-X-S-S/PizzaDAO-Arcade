'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css';

type Rect = { left: number; top: number; width: number; height: number };
type PizzaRect = Rect & { rotate?: number; rotateX?: number; rotateY?: number; rotateZ?: number };
type Layout = { screen: Rect; button: Rect; joystick: Rect; pizza: PizzaRect };
type ActiveDrag = {
  target: keyof Layout;
  mode: 'move' | 'resize';
  startX: number;
  startY: number;
  startRect: Rect;
};

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
    thumbnail: 'https://images.squarespace-cdn.com/content/v1/6462e2c2553b2d3fc022842f/d9c2a6aa-8949-4d23-a9d7-757a2d87e62e/Global_PizzaParty_Animate-ONLY_950.gif?format=750w',
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
const STORAGE_KEY = 'pizzadao.arcade.layout.v1';
const BASE_PATH = process.env.NODE_ENV === 'production' ? '/PizzaDAO-Arcade' : '';
const withBase = (src: string) => (src.startsWith('/') ? `${BASE_PATH}${src}` : src);

const DEFAULT_LAYOUT: Layout = {
  screen: { left: 33.7, top: 20.2, width: 32.3, height: 39.6 },
  button: { left: 80.3, top: 59.2, width: 10.2, height: 5.2 },
  joystick: { left: 49.5, top: 58.8, width: 3.4, height: 10.5 },
  pizza: { left: 77.4, top: 53.8, width: 15.6, height: 8.8, rotate: -7, rotateX: 0, rotateY: 0, rotateZ: -7 }
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export default function PizzaDaoArcadePage() {
  const [zooming, setZooming] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [layout, setLayout] = useState<Layout>(DEFAULT_LAYOUT);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<ActiveDrag | null>(null);
  const clickSfxRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setLayout({
        screen: parsed.screen || DEFAULT_LAYOUT.screen,
        button: parsed.button || DEFAULT_LAYOUT.button,
        joystick: parsed.joystick || DEFAULT_LAYOUT.joystick,
        pizza: {
          ...DEFAULT_LAYOUT.pizza,
          ...(parsed.pizza || {}),
          rotateZ: parsed?.pizza?.rotateZ ?? parsed?.pizza?.rotate ?? DEFAULT_LAYOUT.pizza.rotateZ
        }
      });
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    } catch {}
  }, [layout]);

  useEffect(() => {
    if (!zooming) return;
    const timer = setTimeout(() => setShowMenu(true), 900);
    return () => clearTimeout(timer);
  }, [zooming]);

  useEffect(() => {
    const audio = new Audio(withBase('/pizzadao/start-button-sound.mp3'));
    audio.preload = 'auto';
    clickSfxRef.current = audio;
    return () => {
      clickSfxRef.current = null;
    };
  }, []);

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const active = activeRef.current;
      const scene = sceneRef.current;
      if (!active || !scene) return;

      const rect = scene.getBoundingClientRect();
      const dxPct = ((e.clientX - active.startX) / rect.width) * 100;
      const dyPct = ((e.clientY - active.startY) / rect.height) * 100;

      setLayout((prev) => {
        const next = { ...prev };
        const cur = active.startRect;

        if (active.mode === 'move') {
          next[active.target] = {
            ...cur,
            left: clamp(cur.left + dxPct, 0, 100 - cur.width),
            top: clamp(cur.top + dyPct, 0, 100 - cur.height)
          };
        } else {
          const width = clamp(cur.width + dxPct, 4, 100 - cur.left);
          const height = clamp(cur.height + dyPct, 4, 100 - cur.top);
          next[active.target] = { ...cur, width, height };
        }

        return next;
      });
    }

    function onUp() {
      activeRef.current = null;
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  function startDrag(e: React.PointerEvent, target: keyof Layout, mode: 'move' | 'resize') {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();

    activeRef.current = {
      target,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      startRect: layout[target]
    };
  }

  function playClickSfx() {
    const audio = clickSfxRef.current;
    if (!audio) return;
    try {
      audio.currentTime = 0;
      void audio.play();
    } catch {}
  }

  function onEnter() {
    if (zooming || editMode) return;
    playClickSfx();
    setZooming(true);
  }

  function onPlayNowClick(e: React.MouseEvent<HTMLAnchorElement>, link: string) {
    e.preventDefault();
    playClickSfx();
    setTimeout(() => {
      window.open(link, '_blank', 'noopener,noreferrer');
    }, 90);
  }

  function resetLayout() {
    setLayout(DEFAULT_LAYOUT);
  }

  function patchRect(target: keyof Layout, key: keyof Rect, value: number) {
    setLayout((prev) => ({
      ...prev,
      [target]: {
        ...prev[target],
        [key]: value
      }
    }));
  }

  function patchPizzaAxis(key: 'rotateX' | 'rotateY' | 'rotateZ', value: number) {
    setLayout((prev) => ({
      ...prev,
      pizza: {
        ...prev.pizza,
        [key]: value,
        rotate: key === 'rotateZ' ? value : prev.pizza.rotate
      }
    }));
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

  const pizzaStyle = {
    left: `${layout.pizza.left}%`,
    top: `${layout.pizza.top}%`,
    width: `${layout.pizza.width}%`,
    height: `${layout.pizza.height}%`,
    transform: `perspective(900px) rotateX(${layout.pizza.rotateX ?? 0}deg) rotateY(${layout.pizza.rotateY ?? 0}deg) rotateZ(${layout.pizza.rotateZ ?? layout.pizza.rotate ?? 0}deg)`,
    transformOrigin: '50% 50%'
  };

  return (
    <div className={styles.page}>
      <div className={styles.builderBar}>
        <button className={styles.builderBtn} onClick={() => setEditMode((v) => !v)}>
          {editMode ? 'Lock Layout' : 'Edit Layout'}
        </button>
        <button className={styles.builderBtn} onClick={resetLayout}>Reset</button>
        {editMode ? (
          <div className={styles.tuneRow}>
            <label>Screen W <input type="range" min={8} max={50} step={0.1} value={layout.screen.width} onChange={(e) => patchRect('screen', 'width', Number(e.target.value))} /></label>
            <label>Screen H <input type="range" min={8} max={60} step={0.1} value={layout.screen.height} onChange={(e) => patchRect('screen', 'height', Number(e.target.value))} /></label>
            <label>Btn X <input type="range" min={0} max={95} step={0.1} value={layout.button.left} onChange={(e) => patchRect('button', 'left', Number(e.target.value))} /></label>
            <label>Btn Y <input type="range" min={0} max={95} step={0.1} value={layout.button.top} onChange={(e) => patchRect('button', 'top', Number(e.target.value))} /></label>
            <label>Joy X <input type="range" min={0} max={95} step={0.1} value={layout.joystick.left} onChange={(e) => patchRect('joystick', 'left', Number(e.target.value))} /></label>
            <label>Joy Y <input type="range" min={0} max={95} step={0.1} value={layout.joystick.top} onChange={(e) => patchRect('joystick', 'top', Number(e.target.value))} /></label>
            <label>Pizza X <input type="range" min={0} max={95} step={0.1} value={layout.pizza.left} onChange={(e) => patchRect('pizza', 'left', Number(e.target.value))} /></label>
            <label>Pizza Y <input type="range" min={0} max={95} step={0.1} value={layout.pizza.top} onChange={(e) => patchRect('pizza', 'top', Number(e.target.value))} /></label>
            <label>Pizza RX <input type="range" min={-70} max={70} step={0.5} value={layout.pizza.rotateX ?? 0} onChange={(e) => patchPizzaAxis('rotateX', Number(e.target.value))} /></label>
            <label>Pizza RY <input type="range" min={-35} max={35} step={0.5} value={layout.pizza.rotateY ?? 0} onChange={(e) => patchPizzaAxis('rotateY', Number(e.target.value))} /></label>
            <label>Pizza RZ <input type="range" min={-45} max={45} step={0.5} value={layout.pizza.rotateZ ?? layout.pizza.rotate ?? 0} onChange={(e) => patchPizzaAxis('rotateZ', Number(e.target.value))} /></label>
          </div>
        ) : null}
      </div>

      <div
        ref={sceneRef}
        className={`${styles.scene} ${zooming ? styles.crashZoom : ''}`}
        aria-hidden={showMenu}
      >
        <img
          src={withBase('/pizzadao/arcade-visual.jpg?v=20260330-logo1')}
          alt="PizzaDAO arcade"
          className={styles.background}
        />

        <div
          className={`${styles.gifScreen} ${editMode ? styles.editing : ''}`}
          style={screenStyle}
          onPointerDown={(e) => startDrag(e, 'screen', 'move')}
        >
          <video
            className={styles.screenVideo}
            src={withBase('/pizzadao/arcade-screen.mp4')}
            autoPlay
            loop
            muted
            playsInline
          />
          {editMode ? (
            <span
              className={styles.resizeHandle}
              onPointerDown={(e) => startDrag(e, 'screen', 'resize')}
            />
          ) : null}
        </div>

        <div
          className={`${styles.joystickOverlay} ${editMode ? styles.editing : ''}`}
          style={joystickStyle}
          onPointerDown={(e) => startDrag(e, 'joystick', 'move')}
          aria-hidden
        >
          <span className={styles.joystickStem} />
          <span className={styles.joystickKnob} />
          {editMode ? (
            <span
              className={styles.resizeHandle}
              onPointerDown={(e) => startDrag(e, 'joystick', 'resize')}
            />
          ) : null}
        </div>

        <div
          className={`${styles.pizzaOverlay} ${editMode ? styles.editing : ''}`}
          style={pizzaStyle}
          onPointerDown={(e) => startDrag(e, 'pizza', 'move')}
          aria-label="Stool pizza"
        >
          <img src={withBase('/pizzadao/stool-pizza-v2.png')} alt="Pizza plate" className={styles.pizzaImage} />
          {editMode ? (
            <span
              className={styles.resizeHandle}
              onPointerDown={(e) => startDrag(e, 'pizza', 'resize')}
            />
          ) : null}
        </div>

        <button
          className={`${styles.enterButton} ${editMode ? styles.editing : ''}`}
          style={buttonStyle}
          onClick={onEnter}
          onPointerDown={(e) => startDrag(e, 'button', 'move')}
          aria-label="Start"
        >
          <img src={withBase('/pizzadao/start-button.png')} alt="Start" className={styles.startButtonImage} />
          {editMode ? (
            <span
              className={styles.resizeHandle}
              onPointerDown={(e) => startDrag(e, 'button', 'resize')}
            />
          ) : null}
        </button>
      </div>

      {showMenu ? (
        <div className={styles.menuWrap}>
          <div className={styles.menuCard}>
            <div className={styles.menuHeader}>
              <img src={withBase('/pizzadao/arcade-menu-logo.jpg')} alt="PizzaDAO Arcade" className={styles.menuLogo} />
            </div>
            <div className={styles.menuGrid}>
              {GAME_OPTIONS.map((game) => (
                <a
                  key={game.name}
                  className={styles.gameCard}
                  href={game.link}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => onPlayNowClick(e, game.link)}
                >
                  <div className={styles.gameMeta}>
                    <h3>{game.name}</h3>
                    <p>{game.subtitle}</p>
                    <img src={withBase('/pizzadao/playnow.jpeg')} alt="Play Now" className={styles.playBtnImage} />
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
