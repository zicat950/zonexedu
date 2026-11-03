import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import "@fontsource-variable/inter";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/700.css";

import "./About.css";

/* =========================================================
   HELPERS
   ========================================================= */

const clamp = (n, min = 0, max = 1) =>
  Math.min(max, Math.max(min, n));

function sectionProgress(el) {
  if (!el) return 0;

  const r = el.getBoundingClientRect();
  const total = r.height - window.innerHeight;

  return total <= 0 ? 0 : clamp(-r.top / total);
}

function useScrollLoop(fn) {
  const saved = useRef(fn);
  saved.current = fn;

  useEffect(() => {
    let raf = requestAnimationFrame(function loop() {
      saved.current();
      raf = requestAnimationFrame(loop);
    });

    return () => cancelAnimationFrame(raf);
  }, []);
}

function useInView(threshold = 0.25) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold }
    );

    io.observe(el);

    return () => io.disconnect();
  }, [threshold]);

  return [ref, seen];
}

/* =========================================================
   3D BACKGROUND
   ========================================================= */

const PHI = (1 + Math.sqrt(5)) / 2;

function makeSolid(verts, edgeLen2) {
  const edges = [];

  for (let a = 0; a < verts.length; a++) {
    for (let b = a + 1; b < verts.length; b++) {
      let d = 0;

      for (let i = 0; i < 3; i++) {
        d += (verts[a][i] - verts[b][i]) ** 2;
      }

      if (Math.abs(d - edgeLen2) < 0.02) {
        edges.push([a, b]);
      }
    }
  }

  return { verts, edges };
}

const ICOSA = makeSolid(
  [
    [-1, PHI, 0],
    [1, PHI, 0],
    [-1, -PHI, 0],
    [1, -PHI, 0],
    [0, -1, PHI],
    [0, 1, PHI],
    [0, -1, -PHI],
    [0, 1, -PHI],
    [PHI, 0, -1],
    [PHI, 0, 1],
    [-PHI, 0, -1],
    [-PHI, 0, 1],
  ],
  4
);

const OCTA = makeSolid(
  [
    [1.7, 0, 0],
    [-1.7, 0, 0],
    [0, 1.7, 0],
    [0, -1.7, 0],
    [0, 0, 1.7],
    [0, 0, -1.7],
  ],
  5.78
);

/* =========================================================
   CANVAS SCENE
   ========================================================= */

function createScene(canvas, getProgress) {
  const ctx = canvas.getContext("2d");

  let w = 0;
  let h = 0;
  let dpr = 1;
  let t0 = 0;
  let progS = 0;

  const mouse = {
    x: 0,
    y: 0,
    sx: 0,
    sy: 0,
  };

  const COLS = 46;
  const ROWS = 30;
  const SP = 46;
  const N = (COLS + 1) * (ROWS + 1);

  const PX = new Float32Array(N);
  const PY = new Float32Array(N);
  const PH = new Float32Array(N);
  const OK = new Uint8Array(N);

  const cam = {
    x: 0,
    y: 150,
    z: 0,
    yaw: 0,
    pitch: -0.1,
    f: 800,
  };

  const project = (x, y, z, i) => {
    const dx = x - cam.x;
    const dy = y - cam.y;
    const dz = z - cam.z;

    const cy = Math.cos(cam.yaw);
    const sy = Math.sin(cam.yaw);

    const x1 = dx * cy - dz * sy;
    const z1 = dx * sy + dz * cy;

    const cp = Math.cos(cam.pitch);
    const sp = Math.sin(cam.pitch);

    const y1 = dy * cp - z1 * sp;
    const z2 = dy * sp + z1 * cp;

    if (z2 < 20) {
      OK[i] = 0;
      return;
    }

    const k = cam.f / z2;

    PX[i] = w / 2 + x1 * k;
    PY[i] = h / 2 - y1 * k;

    OK[i] = 1;
  };

  const heightAt = (wx, wz, t) => {
    const edge = Math.min(
      1,
      Math.abs(wx) / (COLS * SP * 0.5)
    );

    const amp = 0.35 + edge * 1.1;

    return (
      Math.sin(wx * 0.011 + t * 0.55) * 26 +
      Math.sin(wz * 0.017 - t * 0.35) * 32 +
      Math.sin((wx + wz) * 0.007 + t * 0.25) * 22
    ) * amp;
  };

  const drawTerrain = (t) => {
    const zoff = t * 38 + progS * 2600;

    const base = Math.floor(zoff / SP);
    const shift = zoff - base * SP;

    for (let j = 0; j <= ROWS; j++) {
      const camZ = 220 + j * SP - shift;
      const worldZ = (base + j) * SP;

      for (let i = 0; i <= COLS; i++) {
        const wx = (i - COLS / 2) * SP;
        const hh = heightAt(wx, worldZ, t);
        const idx = j * (COLS + 1) + i;

        PH[idx] = hh;

        project(
          wx,
          -60 + hh,
          camZ,
          idx
        );
      }
    }

    const far = ROWS * (COLS + 1) + COLS / 2;

    if (OK[far]) {
      const gy = PY[far];

      const g = ctx.createLinearGradient(
        0,
        gy - 170,
        0,
        gy + 130
      );

      g.addColorStop(0, "rgba(18,200,245,0)");
      g.addColorStop(0.55, "rgba(18,200,245,0.11)");
      g.addColorStop(1, "rgba(18,200,245,0)");

      ctx.fillStyle = g;
      ctx.fillRect(0, gy - 170, w, 300);
    }

    const alphaOf = (j) =>
      Math.pow(1 - j / ROWS, 1.5) * 0.55 + 0.02;

    ctx.lineWidth = 1;

    for (let j = 0; j <= ROWS; j++) {
      ctx.strokeStyle =
        `rgba(18,200,245,${alphaOf(j).toFixed(3)})`;

      ctx.beginPath();

      let pen = false;

      for (let i = 0; i <= COLS; i++) {
        const idx = j * (COLS + 1) + i;

        if (!OK[idx]) {
          pen = false;
          continue;
        }

        if (!pen) {
          ctx.moveTo(PX[idx], PY[idx]);
          pen = true;
        } else {
          ctx.lineTo(PX[idx], PY[idx]);
        }
      }

      ctx.stroke();
    }

    for (let j = 0; j < ROWS; j++) {
      ctx.strokeStyle =
        `rgba(30,140,235,${(
          (alphaOf(j) + alphaOf(j + 1)) *
          0.4
        ).toFixed(3)})`;

      ctx.beginPath();

      for (let i = 0; i <= COLS; i++) {
        const a = j * (COLS + 1) + i;
        const b = a + COLS + 1;

        if (!OK[a] || !OK[b]) continue;

        ctx.moveTo(PX[a], PY[a]);
        ctx.lineTo(PX[b], PY[b]);
      }

      ctx.stroke();
    }

    for (let j = 0; j <= ROWS; j += 2) {
      const a = alphaOf(j);

      if (a < 0.12) continue;

      for (let i = 0; i <= COLS; i += 3) {
        const idx = j * (COLS + 1) + i;

        if (!OK[idx] || PH[idx] < 20) continue;

        ctx.fillStyle =
          `rgba(127,227,251,${Math.min(
            1,
            a * 1.7
          ).toFixed(3)})`;

        ctx.beginPath();

        ctx.arc(
          PX[idx],
          PY[idx],
          1.6,
          0,
          6.283
        );

        ctx.fill();
      }
    }
  };

  const drawSolid = (
    solid,
    cx,
    cy,
    size,
    rx,
    ry,
    alpha,
    rgb
  ) => {
    const cxr = Math.cos(rx);
    const sxr = Math.sin(rx);

    const cyr = Math.cos(ry);
    const syr = Math.sin(ry);

    const P = solid.verts.map(([x, y, z]) => {
      const x1 = x * cyr + z * syr;
      const z1 = -x * syr + z * cyr;
      const y1 = y * cxr - z1 * sxr;
      const z2 = y * sxr + z1 * cxr;

      const k = 5 / (5 - z2);

      return [
        cx + x1 * size * k,
        cy + y1 * size * k,
        z2,
      ];
    });

    ctx.shadowColor = `rgba(${rgb},0.9)`;
    ctx.shadowBlur = 12;
    ctx.lineWidth = 1.1;

    for (const [a, b] of solid.edges) {
      const A = P[a];
      const B = P[b];

      const depth = (A[2] + B[2]) / 2;

      const al =
        alpha *
        (0.3 + 0.7 * (depth + 2) / 4);

      ctx.strokeStyle =
        `rgba(${rgb},${al.toFixed(3)})`;

      ctx.beginPath();

      ctx.moveTo(A[0], A[1]);
      ctx.lineTo(B[0], B[1]);

      ctx.stroke();
    }

    for (const v of P) {
      const al = Math.min(
        1,
        alpha *
          1.8 *
          (0.5 + 0.5 * (v[2] + 2) / 4)
      );

      ctx.fillStyle =
        `rgba(${rgb},${al.toFixed(3)})`;

      ctx.beginPath();

      ctx.arc(
        v[0],
        v[1],
        2,
        0,
        6.283
      );

      ctx.fill();
    }

    ctx.shadowBlur = 0;
  };

  const PN = 90;

  const parts = Array.from(
    { length: PN },
    () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: 0.05 + Math.random() * 0.95,
    })
  );

  const SX = new Float32Array(PN);
  const SY = new Float32Array(PN);
  const SA = new Float32Array(PN);

  const drawParticles = () => {
    for (let i = 0; i < PN; i++) {
      const p = parts[i];

      p.z -= 0.00055;

      if (p.z < 0.05) {
        p.z = 1;
        p.x = Math.random() * 2 - 1;
        p.y = Math.random() * 2 - 1;
      }

      const k = 0.5 / p.z;

      SX[i] =
        w / 2 +
        (p.x +
          mouse.sx * 0.25 * (1 - p.z)) *
          w *
          k *
          0.9;

      SY[i] =
        h / 2 +
        (p.y +
          mouse.sy * 0.25 * (1 - p.z)) *
          h *
          k *
          0.6 -
        progS *
          h *
          0.5 *
          (1 - p.z);

      SA[i] =
        Math.min(1, (1 - p.z) * 5) *
        Math.min(1, p.z * 5) *
        0.8;
    }

    ctx.lineWidth = 1;

    for (let i = 0; i < PN; i++) {
      for (let j = i + 1; j < PN; j++) {
        const dx = SX[i] - SX[j];
        const dy = SY[i] - SY[j];
        const d2 = dx * dx + dy * dy;

        if (d2 < 8100) {
          const a =
            (1 - Math.sqrt(d2) / 90) *
            0.2 *
            Math.min(SA[i], SA[j]);

          if (a < 0.01) continue;

          ctx.strokeStyle =
            `rgba(90,210,250,${a.toFixed(3)})`;

          ctx.beginPath();

          ctx.moveTo(SX[i], SY[i]);
          ctx.lineTo(SX[j], SY[j]);

          ctx.stroke();
        }
      }
    }

    for (let i = 0; i < PN; i++) {
      const r = Math.min(
        3.4,
        0.7 / parts[i].z
      );

      ctx.fillStyle =
        `rgba(150,235,255,${SA[i].toFixed(3)})`;

      ctx.beginPath();

      ctx.arc(
        SX[i],
        SY[i],
        r,
        0,
        6.283
      );

      ctx.fill();
    }
  };

  const orb = (cx, cy, r, rgb, a) => {
    const g = ctx.createRadialGradient(
      cx,
      cy,
      0,
      cx,
      cy,
      r
    );

    g.addColorStop(
      0,
      `rgba(${rgb},${a})`
    );

    g.addColorStop(
      1,
      `rgba(${rgb},0)`
    );

    ctx.fillStyle = g;

    ctx.fillRect(
      cx - r,
      cy - r,
      r * 2,
      r * 2
    );
  };

  const resize = () => {
    dpr = Math.min(
      window.devicePixelRatio || 1,
      1.75
    );

    w = window.innerWidth;
    h = window.innerHeight;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );
  };

  const frame = (now) => {
    if (!t0) t0 = now;

    const t = (now - t0) / 1000;

    progS +=
      (getProgress() - progS) * 0.06;

    mouse.sx +=
      (mouse.x - mouse.sx) * 0.05;

    mouse.sy +=
      (mouse.y - mouse.sy) * 0.05;

    cam.x = mouse.sx * 60;
    cam.y = 150 + progS * 60;

    cam.yaw =
      mouse.sx * 0.18 +
      Math.sin(progS * 6.283) * 0.12;

    cam.pitch =
      -0.1 +
      progS * 0.1 +
      mouse.sy * 0.05;

    cam.f = Math.max(w, h) * 0.8;

    ctx.globalCompositeOperation =
      "source-over";

    const bg = ctx.createRadialGradient(
      w * 0.5,
      h * 0.2,
      0,
      w * 0.5,
      h * 0.2,
      Math.max(w, h) * 0.9
    );

    bg.addColorStop(0, "#071a2c");
    bg.addColorStop(0.55, "#040a17");
    bg.addColorStop(1, "#02040d");

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = "lighter";

    orb(
      w * (0.2 + 0.08 * Math.sin(t * 0.2)),
      h * (0.28 + 0.08 * Math.cos(t * 0.17)),
      w * 0.36,
      "18,200,245",
      0.13
    );

    orb(
      w *
        (0.85 +
          0.05 *
            Math.sin(t * 0.23 + 1)),
      h *
        (0.72 -
          progS * 0.3 +
          0.06 *
            Math.cos(t * 0.19)),
      w * 0.4,
      "37,99,235",
      0.15
    );

    orb(
      w *
        (0.55 +
          0.1 *
            Math.sin(
              t * 0.13 +
              progS * 5
            )),
      h *
        (0.5 +
          0.2 *
            Math.sin(progS * 7)),
      w * 0.3,
      "90,60,220",
      0.07
    );

    drawTerrain(t);
    drawParticles();

    const u = Math.min(w, h);

    drawSolid(
      ICOSA,
      w *
        (0.5 +
          0.36 *
            Math.cos(
              progS * 6 + 0.5
            )),
      h *
        (0.4 +
          0.18 *
            Math.sin(progS * 9)),
      u * 0.15,
      t * 0.25 +
        progS * 4 +
        mouse.sy,
      t * 0.35 +
        progS * 6 +
        mouse.sx * 2,
      0.42,
      "18,200,245"
    );

    drawSolid(
      ICOSA,
      w *
        (0.5 +
          0.36 *
            Math.cos(
              progS * 6 + 0.5
            )),
      h *
        (0.4 +
          0.18 *
            Math.sin(progS * 9)),
      u * 0.085,
      -t * 0.4,
      -t * 0.5,
      0.36,
      "127,227,251"
    );

    drawSolid(
      OCTA,
      w *
        (0.5 -
          0.38 *
            Math.cos(
              progS * 5 + 1
            )),
      h *
        (0.62 +
          0.2 *
            Math.sin(
              progS * 7 + 2
            )),
      u * 0.09,
      t * 0.3 + 1,
      t * 0.22 +
        progS * 5,
      0.4,
      "56,150,255"
    );

    ctx.globalCompositeOperation =
      "source-over";

    const vg = ctx.createRadialGradient(
      w / 2,
      h / 2,
      Math.min(w, h) * 0.35,
      w / 2,
      h / 2,
      Math.max(w, h) * 0.8
    );

    vg.addColorStop(
      0,
      "rgba(2,4,13,0)"
    );

    vg.addColorStop(
      1,
      "rgba(2,4,13,0.7)"
    );

    ctx.fillStyle = vg;

    ctx.fillRect(
      0,
      0,
      w,
      h
    );
  };

  return {
    resize,
    frame,
    setMouse: (x, y) => {
      mouse.x = x;
      mouse.y = y;
    },
  };
}

/* =========================================================
   BACKGROUND
   ========================================================= */

function Background({ pageRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let stopped = false;
    let raf = 0;

    const getProgress = () => {
      const el = pageRef.current;
      if (!el) return 0;

      const r = el.getBoundingClientRect();

      const total =
        r.height -
        window.innerHeight;

      return total <= 0
        ? 0
        : clamp(-r.top / total);
    };

    const scene = createScene(
      canvas,
      getProgress
    );

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const loop = (now) => {
      if (stopped) return;

      scene.frame(now);

      raf = requestAnimationFrame(loop);
    };

    const onResize = () => {
      if (stopped) return;

      scene.resize();

      if (reduce) {
        scene.frame(
          performance.now()
        );
      }
    };

    const onMove = (event) => {
      if (stopped) return;

      scene.setMouse(
        event.clientX /
          window.innerWidth -
          0.5,
        event.clientY /
          window.innerHeight -
          0.5
      );
    };

    scene.resize();

    window.addEventListener(
      "resize",
      onResize
    );

    window.addEventListener(
      "mousemove",
      onMove,
      { passive: true }
    );

    if (reduce) {
      scene.frame(
        performance.now()
      );
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      stopped = true;

      if (raf) {
        cancelAnimationFrame(raf);
      }

      window.removeEventListener(
        "resize",
        onResize
      );

      window.removeEventListener(
        "mousemove",
        onMove
      );
    };
  }, [pageRef]);

  return (
    <canvas
      ref={canvasRef}
      className="ab-bg"
      aria-hidden="true"
    />
  );
}

/* =========================================================
   DATA
   ========================================================= */

const CARDS = [
  {
    stage: "STAGE 01",
    title: "THEORY",
    text:
      "Mastering core market mechanics, order book dynamics, risk matrices, and global macro economics before risking capital.",
    icon: "book",
    visual: "bars",
  },
  {
    stage: "STAGE 02",
    title: "PRACTICE",
    text:
      "Simulating real market execution, backtesting algorithmic strategies, and refining position sizing in high-volatility environments.",
    icon: "target",
    visual: "table",
  },
  {
    stage: "STAGE 03",
    title: "EXPERIENCE",
    text:
      "Direct market execution with emotional discipline, risk capital management, and direct mentor-guided live sessions.",
    icon: "check",
    visual: "stats",
  },
];

const CREED = [
  "LEARN.",
  "PRACTICE.",
  "UNDERSTAND.",
  "GROW.",
];

const ROADMAP = [
  {
    n: "01",
    stage: "STAGE 01",
    title: "FOUNDATION",
    text:
      "Understand the market structure, price action dynamics, and liquidity mapping.",
  },
  {
    n: "02",
    stage: "STAGE 02",
    title: "STRATEGY",
    text:
      "Build structured trading knowledge with systematic risk management rules.",
  },
  {
    n: "03",
    stage: "STAGE 03",
    title: "PRACTICE",
    text:
      "Apply concepts to real market situations using live simulator feeds and risk audits.",
  },
  {
    n: "04",
    stage: "STAGE 04",
    title: "MENTORSHIP",
    text:
      "Learn through direct interactive guidance, trade reviews, and ongoing community support.",
  },
];

const STATS = [
  {
    label: "EXECUTION SPEED",
    value: "< 12ms",
    cyan: false,
  },
  {
    label: "MARKET DATA",
    value: "REAL-TIME",
    cyan: true,
  },
  {
    label: "STRATEGY MODULES",
    value: "25+ CORE",
    cyan: false,
  },
  {
    label: "RISK AUDIT",
    value: "AUTOMATED",
    cyan: true,
  },
];

const HUB_NODES = [
  {
    label: "PRACTICAL LEARNING",
    x: 50,
    y: 6,
  },
  {
    label: "CAREER GROWTH",
    x: 12,
    y: 30,
  },
  {
    label: "LIVE MENTORSHIP",
    x: 88,
    y: 30,
  },
  {
    label: "INDUSTRY TOOLS",
    x: 22,
    y: 82,
  },
  {
    label: "MARKET STRATEGIES",
    x: 78,
    y: 82,
  },
];

const BARS = [
  { h: 30, c: "cyan" },
  { h: 45, c: "cyan" },
  { h: 25, c: "red" },
  { h: 70, c: "cyan hi" },
  { h: 42, c: "cyan" },
  { h: 85, c: "cyan hi" },
  { h: 55, c: "cyan" },
];

/* =========================================================
   ICONS
   ========================================================= */

const Icon = ({ name }) => {
  const p = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (name === "book") {
    return (
      <svg {...p}>
        <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
        <path d="M4 21V5" />
      </svg>
    );
  }

  if (name === "target") {
    return (
      <svg {...p}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    );
  }

  if (name === "arrow") {
    return (
      <svg
        {...p}
        width={14}
        height={14}
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    );
  }

  if (name === "down") {
    return (
      <svg
        {...p}
        width={14}
        height={14}
      >
        <path d="M12 5v14M6 13l6 6 6-6" />
      </svg>
    );
  }

  return (
    <svg {...p}>
      <circle
        cx="12"
        cy="12"
        r="9"
      />
      <path d="M8 12.5l3 3 5-6" />
    </svg>
  );
};

/* =========================================================
   HERO
   ========================================================= */

function Hero() {
  const dots = useMemo(
    () =>
      Array.from(
        { length: 46 },
        (_, i) => ({
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 100,
          size:
            1 +
            Math.random() * 2.5,
          delay:
            Math.random() * 6,
          dur:
            4 +
            Math.random() * 6,
        })
      ),
    []
  );

  return (
    <section className="ab-hero">
      <div
        className="ab-particles"
        aria-hidden="true"
      >
        {dots.map((d) => (
          <span
            key={d.id}
            style={{
              left: `${d.left}%`,
              top: `${d.top}%`,
              width: d.size,
              height: d.size,
              animationDelay: `${d.delay}s`,
              animationDuration: `${d.dur}s`,
            }}
          />
        ))}
      </div>

      <div className="ab-hero-inner">
        <span className="ab-badge">
          <i />
          ABOUT ZONEX EDU HUB
        </span>

        <h1 className="ab-hero-title">
          <span className="mask">
            <span className="line l1">
              THE KNOWLEDGE
            </span>
          </span>

          <span className="mask">
            <span className="line l2">
              BEHIND EVERY
            </span>
          </span>

          <span className="mask">
            <span className="line l3 cyan-glow">
              CONFIDENT TRADE.
            </span>
          </span>
        </h1>

        <div className="ab-hero-foot">
          <p>
            INSTITUTIONAL GRADE MARKET
            INTELLIGENCE &amp;
            <br />
            PRACTICAL TRADING
            FRAMEWORKS.
          </p>

          <span className="ab-scroll-hint">
            SCROLL TO EXPLORE
            <Icon name="down" />
          </span>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   CARD VISUALS
   ========================================================= */

function CardVisual({ type }) {
  if (type === "bars") {
    return (
      <div className="cv cv-bars">
        <small>
          ORDERS / HR • ANALYSIS
        </small>

        <div className="bars">
          {BARS.map((b, i) => (
            <span
              key={i}
              className={b.c}
              style={{
                height: `${b.h}%`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className="cv cv-table">
        <div className="row head">
          <span>SIGNAL</span>
          <span>TYPE</span>
          <span>ENTRY</span>
        </div>

        <div className="row">
          <span>#0892</span>
          <span className="cy">BUY</span>
          <span>$1,422.50</span>
        </div>

        <div className="row">
          <span>#0893</span>
          <span className="cy">LONG</span>
          <span>$1,139.80</span>
        </div>

        <div className="row">
          <span>#0894</span>
          <span className="cy">
            ACCUMULATE
          </span>
          <span>$2,480.10</span>
        </div>
      </div>
    );
  }

  return (
    <div className="cv cv-stats">
      <div>
        <strong>1:3.5</strong>
        <small>RISK : REWARD</small>
      </div>

      <div>
        <strong className="cy">
          99.4%
        </strong>
        <small>DISCIPLINE RATE</small>
      </div>
    </div>
  );
}

/* =========================================================
   PHILOSOPHY
   ========================================================= */

function Philosophy() {
  const wrap = useRef(null);
  const track = useRef(null);
  const cur = useRef(0);

  useScrollLoop(() => {
    if (
      !wrap.current ||
      !track.current ||
      window.innerWidth <= 800
    ) {
      return;
    }

    const p = sectionProgress(
      wrap.current
    );

    const max = Math.max(
      0,
      track.current.scrollWidth -
        window.innerWidth
    );

    cur.current +=
      (p - cur.current) * 0.12;

    track.current.style.transform =
      `translate3d(${
        -cur.current * max
      }px,0,0)`;
  });

  return (
    <section
      className="ab-phil"
      ref={wrap}
    >
      <div className="ab-phil-sticky">
        <div
          className="ab-phil-track"
          ref={track}
        >
          <div className="ab-phil-intro">
            <span className="eyebrow">
              01 // OUR PHILOSOPHY
            </span>

            <h2>
              FINANCIAL
              <br />
              EDUCATION SHOULD
              <br />
              BE{" "}
              <em className="cyan">
                PRACTICAL.
              </em>
            </h2>

            <p>
              We believe financial
              education should move
              beyond theory. Zonex Edu
              Hub focuses on practical
              market understanding,
              structured learning,
              mentorship and real-world
              trading knowledge.
            </p>
          </div>

          {CARDS.map((c, i) => (
            <article
              className="ab-card"
              key={c.title}
              style={{
                "--card-delay": `${i * 0.1}s`,
              }}
            >
              <header>
                <span className="eyebrow">
                  {c.stage}
                </span>

                <span className="ic">
                  <Icon
                    name={c.icon}
                  />
                </span>
              </header>

              <h3>{c.title}</h3>

              <p>{c.text}</p>

              <CardVisual
                type={c.visual}
              />

              <span className="card-index">
                0{i + 1}
              </span>
            </article>
          ))}

          <div className="ab-phil-pad" />
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   CREED
   ========================================================= */

function Creed() {
  const wrap = useRef(null);
  const [active, setActive] =
    useState(0);

  useScrollLoop(() => {
    if (!wrap.current) return;

    const p = sectionProgress(
      wrap.current
    );

    const idx = Math.min(
      CREED.length - 1,
      Math.floor(
        p * CREED.length * 0.999
      )
    );

    setActive((prev) =>
      prev === idx ? prev : idx
    );
  });

  return (
    <section
      className="ab-creed"
      ref={wrap}
    >
      <div className="ab-creed-sticky">
        <span className="eyebrow center">
          // CORE CREED
        </span>

        <div className="creed-progress">
          <span
            style={{
              transform: `scaleX(${
                (active + 1) /
                CREED.length
              })`,
            }}
          />
        </div>

        <div className="ab-creed-words">
          {CREED.map((word, i) => {
            const state =
              i === active
                ? "on"
                : i < active
                ? "past"
                : "next";

            return (
              <div
                key={word}
                className={`word ${state} ${
                  i % 2 === 1 ||
                  i === 3
                    ? "is-cyan"
                    : ""
                }`}
              >
                {word}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   PREMIUM ROADMAP
   ========================================================= */

function Roadmap() {
  const line = useRef(null);
  const tl = useRef(null);
  const cur = useRef(0);

  const [step, setStep] =
    useState(0);

  useScrollLoop(() => {
    if (!tl.current) return;

    const r =
      tl.current.getBoundingClientRect();

    const p = clamp(
      (
        window.innerHeight * 0.58 -
        r.top
      ) / r.height
    );

    cur.current +=
      (p - cur.current) * 0.12;

    if (line.current) {
      line.current.style.transform =
        `scaleY(${cur.current})`;
    }

    const s = Math.min(
      ROADMAP.length,
      Math.floor(
        p *
          ROADMAP.length +
          0.28
      )
    );

    setStep((prev) =>
      prev === s ? prev : s
    );
  });

  return (
    <section className="ab-road">
      <div className="ab-road-head">
        <span className="eyebrow center">
          THE ROADMAP
        </span>

        <h2>OUR APPROACH</h2>

        <p className="road-sub">
          A structured path from
          foundation to confident
          market execution.
        </p>
      </div>

      <div
        className="ab-timeline"
        ref={tl}
      >
        <div className="rail">
          <div
            className="fill"
            ref={line}
          />
        </div>

        {ROADMAP.map((item, i) => (
          <div
            key={item.n}
            className={`tl-item ${
              i % 2 === 0
                ? "left"
                : "right"
            } ${
              step > i ? "lit" : ""
            }`}
          >
            <div className="tl-card">
              <div className="tl-card-top">
                <span className="eyebrow">
                  {item.stage}
                </span>

                <span className="tl-arrow">
                  <Icon name="arrow" />
                </span>
              </div>

              <h4>{item.title}</h4>

              <p>{item.text}</p>

              <div className="tl-card-line">
                <span />
              </div>
            </div>

            <span
              className="tl-node"
              style={{
                "--node-index": i,
                "--node-angle": `${
                  cur.current * 360 +
                  i * 90
                }deg`,
              }}
            >
              <span>{item.n}</span>
              <i className="node-orbit">
                <b>›</b>
              </i>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   REALITY
   ========================================================= */

function Reality() {
  const [ref, seen] =
    useInView(0.25);

  return (
    <section
      className={`ab-reality ${
        seen ? "in-view" : ""
      }`}
      ref={ref}
    >
      <div className="reality-glow" />

      <span className="ab-pill">
        <i />
        LIVE SIMULATED TRADING
        ENVIRONMENT
      </span>

      <h2>
        NOT JUST THEORY.
        <br />

        <span className="cyan-glow">
          REAL MARKET
        </span>

        <br />

        <span className="cyan-glow">
          UNDERSTANDING.
        </span>
      </h2>

      <div className="ab-chips">
        {STATS.map((s, i) => (
          <div
            className="chip"
            key={s.label}
            style={{
              transitionDelay: `${
                0.15 + i * 0.1
              }s`,
            }}
          >
            <small>{s.label}</small>

            <strong
              className={
                s.cyan ? "cy" : ""
              }
            >
              {s.value}
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   WHY ZONEX
   ========================================================= */

function Why() {
  const [ref, seen] =
    useInView(0.2);

  return (
    <section
      className={`ab-why ${
        seen ? "in-view" : ""
      }`}
      ref={ref}
    >
      <span className="eyebrow center">
        // ADVANTAGE
      </span>

      <h2>WHY ZONEX EDU HUB</h2>

      <div className="ab-hub">
        <svg
          className="spokes"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {HUB_NODES.map((n, i) => (
            <line
              key={n.label}
              x1="50"
              y1="42"
              x2={n.x}
              y2={n.y + 3}
              style={{
                transitionDelay: `${
                  0.15 + i * 0.1
                }s`,
              }}
            />
          ))}
        </svg>

        <div className="hub-ring ring-one" />
        <div className="hub-ring ring-two" />

        <div className="core">
          <div className="core-pulse" />

          <strong>ZONEX</strong>

          <small>EDU HUB</small>

          <span className="core-arrow">
            ›
          </span>
        </div>

        {HUB_NODES.map((n, i) => (
          <span
            key={n.label}
            className="node"
            style={{
              left: `${n.x}%`,
              top: `${n.y}%`,
              transitionDelay: `${
                0.25 + i * 0.1
              }s`,
              "--node-i": i,
            }}
          >
            <i />
            {n.label}
          </span>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   CTA
   ========================================================= */

function Cta() {
  const [ref, seen] =
    useInView(0.3);

  return (
    <section
      className={`ab-cta ${
        seen ? "in-view" : ""
      }`}
      ref={ref}
    >
      <div className="cta-orbit">
        <span>KNOWLEDGE • STRATEGY • GROWTH •</span>
      </div>

      <h2>
        BUILD THE{" "}
        <span className="cyan-glow">
          KNOWLEDGE.
        </span>

        <br />

        THEN BUILD{" "}
        <span className="cyan-glow">
          THE FUTURE.
        </span>
      </h2>

      <p>
        Your market journey
        starts with
        understanding.
      </p>

      <a
        href="/courses"
        className="ab-btn"
      >
        EXPLORE OUR COURSES
        <Icon name="arrow" />
      </a>
    </section>
  );
}

/* =========================================================
   ABOUT PAGE
   ========================================================= */

export default function About() {
  const pageRef = useRef(null);

  const location =
    useLocation();

  const pathname =
    location.pathname;

  const isAboutPage =
    pathname === "/about" ||
    pathname.startsWith("/about/");

  return (
    <main
      className={`ab-page ${
        isAboutPage
          ? "ab-page-active"
          : "ab-page-inactive"
      }`}
      ref={pageRef}
    >
      {isAboutPage && (
        <Background
          pageRef={pageRef}
        />
      )}

      <Hero />

      <Philosophy />

      <Creed />

      <Roadmap />

      <Reality />

      <Why />

      <Cta />
    </main>
  );
}