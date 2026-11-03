import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Hero.css';

gsap.registerPlugin(ScrollTrigger);

const HEADLINE = [
  [
    { text: "KERALA'S", tone: '' },
    { text: 'FIRST', tone: 'blue' },
  ],
  [
    { text: 'REFUND', tone: '' },
    { text: 'GUARANTEED', tone: 'blue' },
  ],
  [
    { text: 'TRADING', tone: '' },
    { text: 'ACADEMY', tone: '' },
  ],
];

const tickerItems = [
  { symbol: 'GLOBAL INDEX', price: '45,820.40', change: '+2.45%', positive: true },
  { symbol: 'S&P 500', price: '5,840.10', change: '+1.12%', positive: true },
  { symbol: 'NASDAQ', price: '18,420.80', change: '+1.85%', positive: true },
  { symbol: 'FTSE 100', price: '8,250.30', change: '+0.75%', positive: true },
  { symbol: 'NIKKEI 225', price: '39,120.00', change: '+1.42%', positive: true },
];

/* ====================================================================
   Candlestick engine (canvas)
   - candles build left -> right, then the chart streams like a live market
   - newest candle is "formed" in real time (close / wicks move)
   - glowing price line is drawn in, with a glowing head and price badge
   ==================================================================== */
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const easeOut = (t) => 1 - (1 - t) ** 3;
const lerp = (a, b, t) => a + (b - a) * t;

function createChartEngine(canvas) {
  const ctx = canvas.getContext('2d');
  const V = 30; // candles visible at zoom 1 (fewer = bigger, chunkier candles)
  const STEP = 0.75; // seconds per candle while streaming
  let W = 0;
  let H = 0;
  let u = 1; // canvas px per css px

  const S = {
    reveal: 0, // 0 -> 1 : candles grow in
    lineDraw: 0, // 0 -> 1 : price line is drawn
    running: false, // streaming started
    topBase: 0.1, // top offset of the chart area (fraction of height)
    scrollT: 0, // scroll progress target (0..1)
    scrollCur: 0,
    zoomCur: 1,
    flash: 0,
    age: 0,
    lo: null,
    hi: null,
  };

  let price = 100;
  const regime = { len: 0, drift: 0 };
  const nextCandle = () => {
    if (regime.len <= 0) {
      regime.len = 8 + Math.floor(Math.random() * 10);
      regime.drift = [0.5, 0.5, -0.45, 0.1][Math.floor(Math.random() * 4)];
    }
    regime.len -= 1;
    // long "premium" candles: tall bodies + long thin wicks
    const vol = 2.2;
    const o = price;
    // gentle pull toward the middle keeps the price range tight, so every candle looks tall
    const pull = (100 - o) * 0.09;
    const up = Math.random() < 0.5 + regime.drift * 0.3 + pull * 0.08;
    const body = vol * (0.6 + Math.random() * 1.6);
    const c = (up ? o + body : o - body) + pull * 0.5;
    const h = Math.max(o, c) + vol * (0.25 + Math.random() * 1.6);
    const l = Math.min(o, c) - vol * (0.25 + Math.random() * 1.6);
    price = c;
    return { o, h, l, c, v: 0.25 + Math.random() * 0.75 };
  };

  let cds = Array.from({ length: V }, nextCandle);
  let cur = nextCandle();
  let clock = 0;
  const fmt0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
  const fmt2 = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const rr = (x, y, w, h, r) => {
    const rad = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath();
  };

  const resize = () => {
    const cssW = canvas.offsetWidth;
    const cssH = canvas.offsetHeight;
    if (!cssW || !cssH) return;
    u = Math.min((window.devicePixelRatio || 1) * 1.5, 2.5);
    canvas.width = Math.round(cssW * u);
    canvas.height = Math.round(cssH * u);
    W = canvas.width;
    H = canvas.height;
  };

  // used for reduced motion: show a finished chart, no streaming
  const settle = () => {
    cds.push(cur);
    cds.shift();
    cur = nextCandle();
    S.age = 0;
  };

  const draw = (dt) => {
    if (!W) return;
    clock += dt;
    S.scrollCur += (S.scrollT - S.scrollCur) * Math.min(1, dt * 6);
    const zoomT = 1 - 0.42 * S.scrollCur;
    S.zoomCur += (zoomT - S.zoomCur) * Math.min(1, dt * 5);

    if (S.running) {
      S.age += dt / STEP;
      while (S.age >= 1) {
        S.age -= 1;
        cds.push(cur);
        cds.shift();
        cur = nextCandle();
        if (Math.abs(cur.c - cur.o) > 3.2) S.flash = 1; // strong move -> glow burst
      }
    }
    S.flash = Math.max(0, S.flash - dt * 1.4);

    const cssW = W / u;
    const xL = 8 * u;
    const xR = W - Math.min(66, cssW * 0.1) * u;
    const dx = (xR - xL) / (V * S.zoomCur);
    const age = S.age;
    const n = cds.length;
    const showCur = S.running && S.reveal >= 1;

    // build visible items
    const items = [];
    for (let j = 0; j <= n; j += 1) {
      const isCur = j === n;
      if (isCur && !showCur) break;
      const x = xR - (n - j + age) * dx;
      if (x < xL - dx || x > xR + dx) continue;
      if (!isCur) {
        const c = cds[j];
        const st = (j / (n + 1)) * 0.68;
        const s = easeOut(clamp01((S.reveal - st) / 0.32));
        if (s <= 0) continue;
        items.push({ x, o: c.o, h: c.h, l: c.l, c: c.c, v: c.v, s });
      } else {
        const ee = 1 - (1 - age) ** 2;
        const wob = Math.sin(clock * 8) * 0.1 * (1 - age);
        const ct = cur.o + (cur.c - cur.o) * ee + wob;
        const top0 = Math.max(cur.o, cur.c);
        const bot0 = Math.min(cur.o, cur.c);
        items.push({
          x,
          o: cur.o,
          c: ct,
          h: Math.max(cur.o, ct) + (cur.h - top0) * ee,
          l: Math.min(cur.o, ct) - (bot0 - cur.l) * ee,
          v: cur.v * ee,
          s: 1,
        });
      }
    }

    ctx.clearRect(0, 0, W, H);
    if (!items.length) return;

    // auto-fit price range (smoothed)
    let lo = Infinity;
    let hi = -Infinity;
    items.forEach((it) => {
      lo = Math.min(lo, it.l);
      hi = Math.max(hi, it.h);
    });
    const padP = (hi - lo) * 0.1;
    lo -= padP;
    hi += padP;
    if (S.lo === null) {
      S.lo = lo;
      S.hi = hi;
    } else {
      const k = Math.min(1, dt * 3);
      S.lo += (lo - S.lo) * k;
      S.hi += (hi - S.hi) * k;
    }

    const top = H * lerp(S.topBase, 0.06, S.scrollCur);
    const bottom = H * 0.05;
    const chartH = H - top - bottom;
    const volH = chartH * 0.13;
    const plotTop = top + chartH * 0.04;
    const plotH = chartH - volH - chartH * 0.06;
    const y = (p) => plotTop + ((S.hi - p) / (S.hi - S.lo)) * plotH;
    const ga = clamp01(S.reveal * 2.5);
    const bw = Math.max(2 * u, dx * 0.6);

    // grid
    ctx.save();
    ctx.globalAlpha = ga;
    ctx.strokeStyle = 'rgba(125,216,255,0.09)';
    ctx.lineWidth = u;
    ctx.beginPath();
    for (let k = 0; k <= 4; k += 1) {
      const yy = plotTop + (plotH * k) / 4;
      ctx.moveTo(xL, yy);
      ctx.lineTo(xR, yy);
    }
    // vertical lines drift with the data
    for (let j = 0; j <= n; j += 1) {
      if (j % 6 !== 0) continue;
      const gx = xR - (n - j + age) * dx;
      if (gx < xL || gx > xR) continue;
      ctx.moveTo(gx, plotTop);
      ctx.lineTo(gx, plotTop + plotH);
    }
    ctx.stroke();

    // axis labels
    const fs = Math.max(8, Math.min(10.5, cssW * 0.012)) * u;
    ctx.font = `600 ${fs}px Inter, sans-serif`;
    ctx.fillStyle = 'rgba(180,225,255,0.55)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    for (let k = 0; k <= 4; k += 1) {
      const p = S.hi - ((S.hi - S.lo) * k) / 4;
      ctx.fillText(fmt0.format(p * 458.2), xR + 8 * u, plotTop + (plotH * k) / 4);
    }
    ctx.restore();

    // volume
    ctx.save();
    items.forEach((it) => {
      const hgt = Math.max(2 * u, it.v * volH * it.s);
      ctx.fillStyle = it.c >= it.o ? 'rgba(53,167,255,0.28)' : 'rgba(125,216,255,0.14)';
      ctx.fillRect(it.x - bw / 2, H - bottom - hgt, bw, hgt);
    });
    ctx.restore();

    // candles: flat solid white bodies, sharp corners, thin straight wicks, no glow
    const wickW = Math.max(1.5 * u, bw * 0.1);
    ctx.save();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#FFFFFF';

    // wicks
    ctx.beginPath();
    items.forEach((it) => {
      const wx = Math.round(it.x);
      ctx.moveTo(wx, y(it.o + (it.h - it.o) * it.s));
      ctx.lineTo(wx, y(it.o + (it.l - it.o) * it.s));
    });
    ctx.lineWidth = wickW;
    ctx.lineCap = 'butt';
    ctx.stroke();

    // bodies (rising and falling are both solid white rectangles)
    ctx.beginPath();
    items.forEach((it) => {
      const yo = y(it.o);
      const yc = y(it.o + (it.c - it.o) * it.s);
      const top = Math.min(yo, yc);
      ctx.rect(it.x - bw / 2, top, bw, Math.max(3 * u, Math.abs(yo - yc)));
    });
    ctx.fill();
    ctx.restore();

    // glowing price line, drawn in real time
    if (S.lineDraw > 0 && items.length > 2) {
      const pts = items.map((it) => ({ x: it.x, y: y(it.c) }));
      const last = pts[pts.length - 1];
      const first = pts[0];
      const line = new Path2D();
      line.moveTo(first.x, first.y);
      for (let i = 1; i < pts.length - 1; i += 1) {
        line.quadraticCurveTo(pts[i].x, pts[i].y, (pts[i].x + pts[i + 1].x) / 2, (pts[i].y + pts[i + 1].y) / 2);
      }
      line.lineTo(last.x, last.y);
      const area = new Path2D();
      area.addPath(line);
      area.lineTo(last.x, plotTop + plotH);
      area.lineTo(first.x, plotTop + plotH);
      area.closePath();

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, xL + (xR - xL + dx) * S.lineDraw, H);
      ctx.clip();

      const ag = ctx.createLinearGradient(0, plotTop, 0, plotTop + plotH);
      ag.addColorStop(0, 'rgba(53,167,255,0.18)');
      ag.addColorStop(1, 'rgba(20,125,255,0)');
      ctx.fillStyle = ag;
      ctx.fill(area);

      const lg = ctx.createLinearGradient(xL, 0, xR, 0);
      lg.addColorStop(0, 'rgba(20,125,255,0)');
      lg.addColorStop(0.35, '#35A7FF');
      lg.addColorStop(1, '#FFFFFF');
      ctx.strokeStyle = lg;
      ctx.lineWidth = 2.6 * u;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(53,167,255,0.95)';
      ctx.shadowBlur = (12 + 10 * S.flash) * u;
      ctx.stroke(line);
      ctx.restore();

      // glowing head + price badge
      if (S.lineDraw > 0.97) {
        const r = (26 + 18 * S.flash) * u;
        const rg = ctx.createRadialGradient(last.x, last.y, 0, last.x, last.y, r);
        rg.addColorStop(0, `rgba(190,234,255,${0.6 + 0.3 * S.flash})`);
        rg.addColorStop(0.45, 'rgba(53,167,255,0.22)');
        rg.addColorStop(1, 'rgba(53,167,255,0)');
        ctx.fillStyle = rg;
        ctx.fillRect(last.x - r, last.y - r, r * 2, r * 2);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(last.x, last.y, 3.6 * u, 0, 6.2832);
        ctx.fill();

        const label = fmt2.format(items[items.length - 1].c * 458.2);
        ctx.font = `700 ${fs}px Inter, sans-serif`;
        const tw = ctx.measureText(label).width + 14 * u;
        const th = fs * 1.9;
        const bx = Math.min(last.x + 10 * u, W - tw - 2 * u);
        ctx.beginPath();
        rr(bx, last.y - th / 2, tw, th, th / 2);
        ctx.fillStyle = 'rgba(7,28,53,0.82)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(125,216,255,0.5)';
        ctx.lineWidth = u;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(label, bx + tw / 2, last.y + u * 0.5);
      }
    }
  };

  resize();
  return { S, draw, resize, settle };
}

/* distance of an element from an ancestor using layout offsets (ignores transforms) */
const offsetIn = (el, ancestor) => {
  let x = 0;
  let y = 0;
  let e = el;
  while (e && e !== ancestor) {
    x += e.offsetLeft;
    y += e.offsetTop;
    e = e.offsetParent;
  }
  return { x, y };
};

const Hero = () => {
  const rootRef = useRef(null);
  const scrollProgress = useRef(0);

  const handleWhatsAppClick = () => {
    const phoneNumber = '9061878038';
    const message = encodeURIComponent('Hi, I want to get more details about zonex trading education courses.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  /* ------------------------------------------------------------------
     Cinematic sequence
     1. full-screen candle build  2. camera pulls back to the laptop
     3. heading appears inside the laptop, buttons rise outside
     4. scroll pushes the camera back into the chart
     ------------------------------------------------------------------ */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const q = (sel) => gsap.utils.toArray(sel, root);
    const one = (sel) => root.querySelector(sel);

    const canvas = one('.zx-chart-canvas');
    const screen = one('.zx-screen');
    const camScroll = one('.zx-cam--scroll');
    const camIntro = one('.zx-cam--intro');

    const eng = createChartEngine(canvas);
    const { S } = eng;

    // render loop (shared GSAP ticker, paused when hero is off-screen)
    let inView = true;
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
    });
    io.observe(root);
    const onTick = (time, deltaTime) => {
      if (inView) eng.draw(Math.min(deltaTime / 1000, 0.05));
    };
    gsap.ticker.add(onTick);
    const ro = new ResizeObserver(() => {
      eng.resize();
      eng.draw(0);
    });
    ro.observe(screen);

    // camera geometry (uses layout offsets, so it is safe while transforms are active)
    const geom = () => {
      const inRoot = offsetIn(screen, root);
      const sw = screen.offsetWidth;
      const sh = screen.offsetHeight;
      const cx = inRoot.x + sw / 2;
      const cy = inRoot.y + sh / 2;
      const hw = root.clientWidth;
      const hh = root.clientHeight - 50; // visible area above the ticker
      const inCam = offsetIn(screen, camIntro);
      return {
        dx: hw / 2 - cx,
        dy: hh / 2 - cy,
        fill: Math.max(hw / sw, hh / sh) * 1.03,
        origin: `${inCam.x + sw / 2}px ${inCam.y + sh / 2}px`,
      };
    };

    const mm = gsap.matchMedia();

    mm.add(
      {
        desk: '(min-width: 969px)',
        reduce: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { desk, reduce } = context.conditions;

        if (reduce) {
          // finished, calm composition
          S.reveal = 1;
          S.lineDraw = 1;
          S.topBase = 0.4;
          eng.settle();
          eng.draw(0);
          return undefined;
        }

        const kk = desk ? 1 : 0.45; // scroll push-in strength
        const words = q('.zx-word');
        const shade = one('.zx-screen-shade');
        const glow = q('.zx-stage-glow, .zx-desk-glow');
        const beams = one('.zx-bg-beams');
        const desc = one('.zx-desc');
        const btns = q('.zx-btn');
        const g0 = geom();

        /* ---------- initial state: camera inside the screen ---------- */
        gsap.set([camScroll, camIntro], { transformOrigin: g0.origin });
        gsap.set(camIntro, { x: g0.dx, y: g0.dy, scale: g0.fill });
        gsap.set(words, { yPercent: 115, opacity: 0, filter: 'blur(6px)' });
        gsap.set([desc, ...btns], { opacity: 0, y: 18 });
        gsap.set([shade, ...glow, beams], { opacity: 0 });

        const tl = gsap.timeline({ delay: 0.2 });

        // 1) candles build across the full screen, camera drifts in slowly
        tl.to(S, { reveal: 1, duration: 2.3, ease: 'power1.inOut', onComplete: () => { S.running = true; } }, 0)
          .to(camIntro, { scale: g0.fill * 1.05, duration: 2.7, ease: 'none' }, 0);

        // 2) pull back: the chart shrinks into the laptop screen
        tl.to(camIntro, { x: 0, y: 0, scale: 1, duration: 2.3, ease: 'power3.inOut' }, 2.7)
          .fromTo(camIntro, { rotationY: 0 }, { rotationY: desk ? -9 : -5, duration: 1.2, ease: 'sine.inOut' }, 2.7)
          .to(camIntro, { rotationY: 0, duration: 1.4, ease: 'power3.out' }, 3.9);
        if (desk) {
          tl.fromTo(camIntro, { filter: 'blur(0px)' }, { filter: 'blur(3px)', duration: 0.4, yoyo: true, repeat: 1, ease: 'sine.inOut', onComplete: () => gsap.set(camIntro, { clearProps: 'filter' }) }, 2.8);
        }
        tl.to(glow, { opacity: 1, duration: 1.8, ease: 'power2.out' }, 3.0)
          .to(beams, { opacity: 1, duration: 2, ease: 'power2.out' }, 3.0)
          .to(S, { lineDraw: 1, duration: 1.8, ease: 'power2.inOut' }, 3.0);

        // 3) chart settles into the lower part of the screen, heading comes in
        tl.to(S, { topBase: 0.4, duration: 1.5, ease: 'power3.inOut' }, 3.7)
          .to(shade, { opacity: 1, duration: 1.2 }, 3.8)
          .to(words, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'expo.out', stagger: 0.11, onComplete: () => gsap.set(words, { clearProps: 'filter' }) }, 4.2)
          .to(desc, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', clearProps: 'transform,opacity' }, 5.0)
          .to(btns, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12, clearProps: 'transform,opacity' }, 5.25);

        /* ---------- scroll: camera pushes back into the chart ---------- */
        const st = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root,
            start: 0,
            end: () => `+=${Math.round(root.offsetHeight * 0.85)}`,
            scrub: 0.9,
            invalidateOnRefresh: true,
            onRefreshInit: () => {
              gsap.set([camScroll, camIntro], { transformOrigin: geom().origin });
            },
            onUpdate: (self) => {
              scrollProgress.current = self.progress;
              S.scrollT = self.progress;
            },
          },
        });

        st.to(
          camScroll,
          {
            x: () => geom().dx * kk,
            y: () => geom().dy * kk,
            scale: () => 1 + (geom().fill - 1) * kk,
            ease: 'power2.in',
            duration: 1,
          },
          0
        )
          .to(one('.zx-screen-copy'), { opacity: 0, y: -12, duration: 0.45 }, 0.03)
          .to(one('.zx-desc-wrap'), { opacity: 0, duration: 0.4 }, 0);

        return () => {
          tl.kill();
          if (st.scrollTrigger) st.scrollTrigger.kill();
          st.kill();
        };
      }
    );

    return () => {
      mm.revert();
      gsap.ticker.remove(onTick);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  /* ------------------------------------------------------------------
     Subtle background particles (canvas, paused when off-screen)
     ------------------------------------------------------------------ */
  useEffect(() => {
    const root = rootRef.current;
    const canvas = root && root.querySelector('.zx-particles');
    const c = canvas && canvas.getContext('2d');
    if (!c || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let parts = [];
    let raf = 0;
    let last = 0;
    let inView = true;

    const build = () => {
      w = root.clientWidth;
      h = root.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = window.innerWidth <= 968 ? 14 : 34;
      parts = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: 0.25 + Math.random() * 0.75,
        ph: Math.random() * 6.28,
        sp: 0.6 + Math.random() * 1.2,
      }));
    };

    const loop = (t) => {
      const dt = Math.min((t - last) / 16.7, 3);
      last = t;
      c.clearRect(0, 0, w, h);
      const s = scrollProgress.current;
      for (let i = 0; i < parts.length; i += 1) {
        const p = parts[i];
        p.y -= (0.12 + 0.28 * p.z) * dt;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        const a = (0.12 + 0.4 * p.z) * (0.65 + 0.35 * Math.sin((t / 1000) * p.sp + p.ph));
        const x = p.x + Math.sin((t / 4000) * p.sp + p.ph) * 6;
        const y = p.y - s * p.z * 90;
        c.fillStyle = p.z > 0.75 ? `rgba(255,255,255,${a})` : `rgba(125,216,255,${a})`;
        c.beginPath();
        c.arc(x, y, 0.5 + p.z * 1.4, 0, 6.2832);
        c.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf && inView && !document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    build();
    start();
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      if (inView) start();
      else stop();
    });
    io.observe(root);
    const ro = new ResizeObserver(build);
    ro.observe(root);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  let wordIndex = 0;

  return (
    <section className="zx-hero" ref={rootRef}>
      {/* Background lighting */}
      <div className="zx-bg" aria-hidden="true">
        <div className="zx-bg-base"></div>
        <div className="zx-bg-beams"></div>
        <div className="zx-bg-glow zx-bg-glow--a"></div>
        <div className="zx-bg-glow zx-bg-glow--b"></div>
        <div className="zx-bg-sweep"></div>
        <canvas className="zx-particles"></canvas>
      </div>

      <div className="zx-inner">
        <div className="zx-stage">
          {/* LAPTOP: the camera rigs (scroll + intro) wrap the whole laptop */}
          <div className="zx-cam zx-cam--scroll">
            <div className="zx-cam zx-cam--intro">
              <div className="zx-laptop-float">
                <div className="zx-stage-glow" aria-hidden="true"></div>

                <div className="zx-lid">
                  <div className="zx-screen">
                    <canvas className="zx-chart-canvas" aria-hidden="true"></canvas>
                    <div className="zx-screen-shade" aria-hidden="true"></div>
                    <div className="zx-screen-chrome" aria-hidden="true">
                      <i></i><i></i><i></i>
                      <span></span>
                    </div>

                    {/* HEADING lives inside the laptop screen */}
                    <div className="zx-screen-copy">
                      <h1 className="zx-title" aria-label="Kerala's first refund guaranteed trading academy">
                        {HEADLINE.map((line, li) => (
                          <span className="zx-line" key={li} aria-hidden="true">
                            {line.map((word) => {
                              const i = wordIndex++;
                              return (
                                <span className="zx-mask" key={word.text}>
                                  <span
                                    className={`zx-word ${word.tone ? `zx-${word.tone}` : ''}`}
                                    style={{ '--i': i }}
                                  >
                                    {word.text}
                                  </span>
                                </span>
                              );
                            })}
                          </span>
                        ))}
                      </h1>
                    </div>
                    <div className="zx-screen-glare" aria-hidden="true"></div>
                  </div>
                </div>

                <div className="zx-base" aria-hidden="true"></div>
                <div className="zx-desk-glow" aria-hidden="true"></div>
              </div>
            </div>
          </div>

          {/* OUTSIDE the laptop: description + buttons */}
          <div className="zx-below">
            <div className="zx-desc-wrap">
              <p className="zx-desc">
                Master the financial markets with structured training, live mentorship and a
                refund guarantee. Build a trading career alongside your degree.
              </p>
            </div>

            <div className="zx-cta">
              <Link to="/profit" className="zx-btn zx-btn--primary">
                <span className="zx-btn-icon">📊</span> View Live P&amp;L
              </Link>
              <a href="#courses" className="zx-btn zx-btn--ghost">
                Explore Courses
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <div className="zx-wa" onClick={handleWhatsAppClick} role="button" tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleWhatsAppClick()}
        aria-label="Chat on WhatsApp">
        <div className="zx-wa-ring"></div>
        <div className="zx-wa-btn">
          <svg className="zx-wa-icon" viewBox="0 0 24 24" width="32" height="32">
            <path fillRule="evenodd" clipRule="evenodd" d="M18.403 5.633A10.45 10.45 0 0 0 10.77 2.5C5.03 2.5 0.354 7.177 0.354 12.92c0 1.88.492 3.719 1.428 5.334L.25 23.75l5.656-1.482a10.4 10.4 0 0 0 4.864 1.238h.005c5.74 0 10.417-4.676 10.417-10.417 0-2.784-1.083-5.4-3.189-7.456zM10.77 21.51c-1.63 0-3.228-.439-4.622-1.27l-.331-.196-3.433.899 1.002-3.35-.215-.342a8.683 8.683 0 0 1-1.332-4.62c0-4.8 3.91-8.71 8.715-8.71 2.327 0 4.515.907 6.158 2.553 1.644 1.645 2.55 3.835 2.55 6.162 0 4.807-3.91 8.716-8.712 8.716zm4.776-6.52c-.261-.13-1.543-.762-1.782-.849-.239-.087-.413-.13-.587.13-.174.261-.674.848-.826 1.022-.152.174-.304.196-.565.065-.261-.13-1.102-.406-2.1-1.296-.777-.693-1.3-1.547-1.454-1.808-.152-.261-.016-.402.114-.532.117-.117.261-.304.391-.456.13-.152.174-.261.261-.435.087-.174.043-.326-.022-.456-.065-.13-.587-1.414-.804-1.938-.211-.51-.427-.44-.587-.448-.152-.007-.326-.007-.5-.007-.174 0-.456.065-.695.326-.239.261-.913.892-.913 2.176 0 1.284.935 2.525 1.065 2.701.13.176 1.838 2.805 4.456 3.931.622.269 1.108.43 1.487.551.623.199 1.19.171 1.638.104.5-.075 1.543-.631 1.761-1.241.218-.61.218-1.132.152-1.241-.065-.109-.239-.174-.5-.304z"/>
          </svg>
        </div>
      </div>

      {/* Global Market Ticker Bar (kept attached to the bottom edge) */}
      <div className="zx-ticker">
        <div className="zx-ticker-track">
          {[0, 1, 2, 3].flatMap((copy) =>
            tickerItems.map((item, index) => (
              <div className="zx-ticker-item" key={`${copy}-${index}`}>
                <span className="zx-ticker-symbol">{item.symbol}</span>
                <span className="zx-ticker-price">{item.price}</span>
                <span className={`zx-ticker-change ${item.positive ? 'positive' : 'negative'}`}>
                  {item.change}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;