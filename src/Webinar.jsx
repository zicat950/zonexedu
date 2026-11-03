import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import "./Webinar.css";

/* ================= CONFIG (edit meetLink weekly) ================= */
// ===== EDIT THIS EVERY WEEKEND: paste the new Google Meet link in meetLink =====
export const webinarConfig = {
  title: "Friday Trading Masterclass",
  day: "Friday",
  time: "8:30 PM",
  timezone: "Asia/Kolkata", // countdown is calculated in IST
  durationMinutes: 90,      // how long the session shows as LIVE
  platform: "Google Meet",
  host: "ZONEX EDUHUB",
  meetLink: "https://meet.google.com/bnw-tbwa-uim", // e.g. "https://meet.google.com/abc-defg-hij"
};

/* ================= WEBINAR VIDEOS (auto from src/assets) ================= */
// Videos are picked up automatically from src/assets (Vite 5+).
// Any video whose path contains "webinar" is used (e.g. src/assets/webinar/session1.mp4
// or src/assets/webinar-week1.mp4). Set VIDEO_MATCH to "" to use every video in src/assets.
const VIDEO_MATCH = "webinar";

const videoFiles = import.meta.glob("../assets/**/*.{mp4,webm,mov}", {
  eager: true,
  query: "?url",
  import: "default",
});

const prettyName = (path) =>
  path
    .split("/")
    .pop()
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const autoVideos = Object.entries(videoFiles)
  .filter(([p]) => p.toLowerCase().includes(VIDEO_MATCH))
  .map(([p, src], i) => ({
    id: `auto-${i}`,
    title: prettyName(p),
    subtitle: "Live webinar session",
    src,
  }));

// Optional: add/override videos manually.
import intro from "./assets/myvideo.mp4";
// { id: "m1", title: "Market Structure Basics", subtitle: "Week 12", src: intro, poster: posterImg }
const manualVideos = [];

export const webinarVideos = [...manualVideos, ...autoVideos];

/* ================= WEBINAR PHOTOS (auto from src/assets) ================= */
// Photos are picked up automatically from src/assets (Vite 5+).
// Any image whose path contains "webinar" is used (e.g. src/assets/webinar/photo1.jpg).
// Set PHOTO_MATCH to "" to use every image in src/assets (logos included, so keep the filter).
const PHOTO_MATCH = "webinar";

const photoFiles = import.meta.glob("./asset/myvideo.mp4}", {
  eager: true,
  query: "intro",
  import: "intro",
});

const autoPhotos = Object.entries(photoFiles)
  .filter(([p]) => p.toLowerCase().includes(PHOTO_MATCH) && !p.toLowerCase().includes("logo"))
  .map(([p, src], i) => ({
    id: `auto-${i}`,
    src,
    alt: `ZONEX webinar moment ${i + 1}`,
  }));

// Optional manual entries:
// import photo from "../assets/my-photo.jpg";
// { id: "m1", src: photo, alt: "Live session" }
const manualPhotos = [];

export const webinarGallery = [...manualPhotos, ...autoPhotos];


/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const IST_OFFSET = 5.5 * 60 * 60 * 1000;
const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function parseTime(str) {
  const m = /(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i.exec(str || "8:30 PM");
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2] || "0", 10);
  const ap = (m[3] || "").toUpperCase();
  if (ap === "PM" && h < 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return { h, min };
}

// Returns { start, end, isLive } for the current/next session, computed in IST.
function getSession(now = Date.now()) {
  const { day, time, durationMinutes = 90 } = webinarConfig;
  const target = Math.max(0, DAYS.indexOf(String(day).toLowerCase()));
  const { h, min } = parseTime(time);
  const ist = new Date(now + IST_OFFSET); // read with getUTC* = IST wall clock
  const base = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate(), h, min) - IST_OFFSET;
  const diffDays = (target - ist.getUTCDay() + 7) % 7;
  let start = base + diffDays * 86400000;
  const dur = durationMinutes * 60000;
  if (now >= start + dur) start += 7 * 86400000;
  return { start, end: start + dur, isLive: now >= start && now < start + dur };
}

const pad = (n) => String(n).padStart(2, "0");
const isLinkSet = (l) => /^https?:\/\//i.test(l || "");

function useNow(interval = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function Reveal({ as: Tag = "div", delay = 0, className = "", children, ...rest }) {
  const ref = useReveal();
  return (
    <Tag ref={ref} className={`wb-reveal ${className}`} style={{ "--d": `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

/* Single source of truth for every Google Meet button */
function MeetButton({ className = "", children, ...rest }) {
  return (
    <a
      href={webinarConfig.meetLink}
      target="_blank"
      rel="noopener noreferrer"
      className={`wb-btn ${className}`}
      {...rest}
    >
      {children}
    </a>
  );
}

/* Inline icons (no extra dependencies) */
const Icon = {
  Meet: (p) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <rect x="2" y="6" width="13" height="12" rx="2.5" fill="currentColor" opacity=".9" />
      <path d="M16 10.5l5-3.2v9.4l-5-3.2z" fill="currentColor" opacity=".6" />
    </svg>
  ),
  Cal: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...p}>
      <rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  ),
  Clock: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...p}>
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
    </svg>
  ),
  Play: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M8 5.5v13a1 1 0 001.5.86l11-6.5a1 1 0 000-1.72l-11-6.5A1 1 0 008 5.5z" /></svg>
  ),
  Close: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>
  ),
  Brain: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" /><path d="M22 9v6" />
    </svg>
  ),
  Chart: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 3v18h18" /><path d="M7 15l4-5 3 3 5-7" /><path d="M15 6h4v4" />
    </svg>
  ),
  Chat: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 12a8 8 0 01-11.7 7.1L3 20.5l1.4-5.2A8 8 0 1121 12z" /><path d="M8.5 11h7M8.5 14h4" />
    </svg>
  ),
  Repeat: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M17 2l4 4-4 4" /><path d="M3 11V9a3 3 0 013-3h15" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v2a3 3 0 01-3 3H3" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/* Colorful full-page background (sits behind every section)           */
/* ------------------------------------------------------------------ */
function PageBackground() {
  const candles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        left: `${3 + i * 5.4}%`,
        h: 40 + ((i * 37) % 90),
        up: i % 3 !== 0,
        dur: `${6 + (i % 5) * 1.5}s`,
        delay: `${-(i % 7) * 0.9}s`,
      })),
    []
  );
  return (
    <div className="wb-bg" aria-hidden="true">
      <div className="wb-blob wb-blob-1" />
      <div className="wb-blob wb-blob-2" />
      <div className="wb-blob wb-blob-3" />
      <div className="wb-blob wb-blob-4" />
      <div className="wb-blob wb-blob-5" />
      <div className="wb-blob wb-blob-6" />
      <div className="wb-bg-grid" />
      <div className="wb-candles">
        {candles.map((c, i) => (
          <span
            key={i}
            className={`wb-candle ${c.up ? "up" : "down"}`}
            style={{ left: c.left, height: c.h, animationDuration: c.dur, animationDelay: c.delay }}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */
function WebinarHero({ isLive }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        left: `${(i * 37) % 100}%`,
        size: 2 + (i % 4),
        dur: `${9 + (i % 7) * 2}s`,
        delay: `${-(i % 9) * 1.4}s`,
      })),
    []
  );

  return (
    <section className="wb-hero" id="webinar-top">
      <div className="wb-hero-bg" aria-hidden="true">
        <svg className="wb-chart" viewBox="0 0 1200 400" preserveAspectRatio="none">
          <defs>
            <linearGradient id="wbl" x1="0" x2="1">
              <stop offset="0" stopColor="#2f7bff" stopOpacity="0" />
              <stop offset=".5" stopColor="#22d3ee" />
              <stop offset="1" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path className="wb-line" pathLength="1" d="M0 320 L90 290 L170 305 L260 230 L340 250 L430 170 L520 200 L610 120 L700 150 L790 90 L880 130 L980 60 L1080 85 L1200 30" />
          <path className="wb-line wb-line-2" pathLength="1" d="M0 360 L120 340 L220 350 L330 290 L450 310 L560 250 L680 270 L800 210 L920 240 L1040 180 L1200 200" />
        </svg>
        {particles.map((p, i) => (
          <span key={i} className="wb-particle" style={{ left: p.left, width: p.size, height: p.size, animationDuration: p.dur, animationDelay: p.delay }} />
        ))}
      </div>

      <div className="wb-container wb-hero-inner">
        <div className="wb-hero-copy">
          <span className={`wb-badge ${isLive ? "is-live" : ""}`}>
            <i className="wb-dot" /> {isLive ? "LIVE NOW" : "LIVE WEBINAR"}
          </span>
          <h1 className="wb-h1">
            <span className="wb-line-txt">LEARN. CONNECT.</span>
            <span className="wb-line-txt">MASTER THE <span className="wb-grad">MARKET.</span></span>
          </h1>
          <p className="wb-lead">
            Join our exclusive weekly trading webinars and learn directly from experienced market professionals.
            Discover strategies, understand market movements and improve your trading knowledge.
          </p>
          <div className="wb-actions">
            <MeetButton className="wb-btn-primary">
              <Icon.Meet className="wb-ico" /> JOIN LIVE WEBINAR
            </MeetButton>
            <a className="wb-btn wb-btn-ghost" href="#webinar-experience">EXPLORE PAST WEBINARS</a>
          </div>
        </div>

        <aside className="wb-info-card" aria-label="Webinar schedule">
          <span className="wb-card-label">WEEKLY LIVE WEBINAR</span>
          <ul className="wb-info-list">
            <li><Icon.Cal className="wb-ico" /><div className="wb-info-txt"><small>Day</small><b>Every {webinarConfig.day}</b></div></li>
            <li><Icon.Clock className="wb-ico" /><div className="wb-info-txt"><small>Time</small><b>{webinarConfig.time} IST</b></div></li>
            <li><Icon.Meet className="wb-ico" /><div className="wb-info-txt"><small>Platform</small><b>{webinarConfig.platform}</b></div></li>
          </ul>
          <p className="wb-host">Hosted by <b>{webinarConfig.host}</b></p>
        </aside>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Upcoming + countdown                                                */
/* ------------------------------------------------------------------ */
function Tick({ value, label }) {
  return (
    <div className="wb-tick">
      <span className="wb-tick-num">{value}</span>
      <small>{label}</small>
    </div>
  );
}

function UpcomingWebinar() {
  const now = useNow(1000);
  const { start, isLive } = getSession(now);
  const left = Math.max(0, start - now);
  const d = Math.floor(left / 86400000);
  const h = Math.floor((left % 86400000) / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);

  const sd = new Date(start + IST_OFFSET);
  const month = sd.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase();
  const weekday = sd.toLocaleString("en-US", { weekday: "long", timeZone: "UTC" });
  const soon = !isLive && left < 3600000;
  const status = isLive
    ? "Session is live. Join now."
    : soon
    ? "Starting soon. Be ready to join."
    : `Next session in ${d > 0 ? `${d} day${d > 1 ? "s" : ""}` : `${h} hr`}`;

  return (
    <section className="wb-section" id="webinar-upcoming">
      <div className="wb-container">
        <Reveal className="wb-sec-head">
          <h2 className="wb-h2">Upcoming <span className="wb-grad">Session</span></h2>
        </Reveal>

        <Reveal className="wb-upcoming wb-glow-border" delay={100}>
          <div className="wb-date" aria-hidden="true">
            <span className="wb-date-month">{month}</span>
            <span className="wb-date-day">{sd.getUTCDate()}</span>
            <span className="wb-date-wd">{weekday.slice(0, 3).toUpperCase()}</span>
          </div>

          <div className="wb-up-main">
            <span className={`wb-badge ${isLive ? "is-live" : ""}`}>
              <i className="wb-dot" /> {isLive ? "LIVE SESSION" : "UPCOMING LIVE SESSION"}
            </span>
            <h3 className="wb-h3">{webinarConfig.title}</h3>
            <p className="wb-meta">
              <span className="wb-meta-item"><Icon.Clock className="wb-ico-sm" /> {webinarConfig.day} | {webinarConfig.time} IST</span>
              <span className="wb-sep" />
              <span className="wb-meta-item"><Icon.Meet className="wb-ico-sm" /> Live on {webinarConfig.platform}</span>
            </p>

            {isLive ? (
              <div className="wb-live-now"><i className="wb-dot" /> The webinar has started</div>
            ) : (
              <div className="wb-count" role="timer" aria-live="off">
                <Tick value={pad(d)} label="Days" />
                <span className="wb-colon">:</span>
                <Tick value={pad(h)} label="Hours" />
                <span className="wb-colon">:</span>
                <Tick value={pad(m)} label="Minutes" />
                <span className="wb-colon">:</span>
                <Tick value={pad(s)} label="Seconds" />
              </div>
            )}
            <p className="wb-status">{status}</p>
          </div>

          <div className="wb-up-cta">
            <MeetButton className={`wb-btn-primary ${isLive ? "wb-pulse" : ""}`}>
              <Icon.Meet className="wb-ico" /> {isLive ? "JOIN NOW" : "JOIN WEBINAR"}
            </MeetButton>
            {!isLinkSet(webinarConfig.meetLink) && (
              <small className="wb-warn">Add your Meet link in the CONFIG block at the top of Webinar.jsx</small>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Videos                                                              */
/* ------------------------------------------------------------------ */
function WebinarVideos({ onOpen }) {
  return (
    <section className="wb-section" id="webinar-experience">
      <div className="wb-container">
        <Reveal className="wb-sec-head">
          <h2 className="wb-h2">Experience Our <span className="wb-grad">Webinars</span></h2>
          <p className="wb-sub">Watch highlights from our live sessions.</p>
        </Reveal>

        {webinarVideos.length === 0 ? (
          <Reveal className="wb-empty">
            No videos found. Add .mp4 files with “webinar” in the file path under src/assets, or add them to
          </Reveal>
        ) : (
          <div className="wb-video-grid">
            {webinarVideos.map((v, i) => (
              <Reveal as="button" type="button" key={v.id} delay={i * 90} className="wb-video-card wb-glow-border" onClick={() => onOpen(v)} aria-label={`Play ${v.title}`}>
                <div className="wb-thumb">
                  {v.poster ? (
                    <img src={v.poster} alt="" loading="lazy" />
                  ) : (
                    <video src={`${v.src}#t=0.8`} preload="metadata" muted playsInline tabIndex={-1} />
                  )}
                  <span className="wb-play"><Icon.Play /></span>
                </div>
                <div className="wb-video-info">
                  <b>{v.title}</b>
                  <small>{v.subtitle}</small>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Gallery                                                             */
/* ------------------------------------------------------------------ */
function WebinarGallery({ onOpen }) {
  return (
    <section className="wb-section" id="webinar-moments">
      <div className="wb-container">
        <Reveal className="wb-sec-head">
          <h2 className="wb-h2">Our Webinar <span className="wb-grad">Moments</span></h2>
          <p className="wb-sub">Photos from previous sessions.</p>
        </Reveal>

        {webinarGallery.length === 0 ? (
          <Reveal className="wb-empty">
            No photos found. Add images with “webinar” in the file path under src/assets, or add them to manualPhotos at the top of Webinar.jsx.
          </Reveal>
        ) : (
          <div className="wb-gallery">
            {webinarGallery.map((img, i) => (
              <Reveal as="button" type="button" key={img.id} delay={(i % 6) * 70} className="wb-photo wb-glow-border" onClick={() => onOpen(i)} aria-label={`Open photo ${i + 1}`}>
                <img src={img.src} alt={img.alt} loading="lazy" />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Benefits                                                            */
/* ------------------------------------------------------------------ */
const benefits = [
  { n: "01", t: "EXPERT KNOWLEDGE", d: "Learn trading concepts and strategies from experienced professionals.", i: Icon.Brain, c: "cyan" },
  { n: "02", t: "LIVE MARKET DISCUSSIONS", d: "Understand market movements and real-world trading scenarios.", i: Icon.Chart, c: "violet" },
  { n: "03", t: "INTERACTIVE LEARNING", d: "Ask questions and interact directly during live sessions.", i: Icon.Chat, c: "pink" },
  { n: "04", t: "WEEKLY KNOWLEDGE", d: "Stay consistent with a dedicated weekly learning experience.", i: Icon.Repeat, c: "green" },
];

function WebinarBenefits() {
  return (
    <section className="wb-section" id="webinar-why">
      <div className="wb-container">
        <Reveal className="wb-sec-head">
          <h2 className="wb-h2">Why Join Our <span className="wb-grad">Webinars?</span></h2>
        </Reveal>
        <div className="wb-benefits">
          {benefits.map(({ n, t, d, i: I, c }, k) => (
            <Reveal key={n} delay={k * 110} className={`wb-benefit wb-c-${c}`}>
              <span className="wb-benefit-n">{n}</span>
              <span className="wb-benefit-ico"><I /></span>
              <h3>{t}</h3>
              <p>{d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* CTA                                                                 */
/* ------------------------------------------------------------------ */
function WebinarCTA() {
  return (
    <section className="wb-section wb-cta-section" id="webinar-join">
      <div className="wb-container">
        <Reveal className="wb-cta wb-glow-border">
          <h2 className="wb-h2">YOUR NEXT LEVEL STARTS WITH <span className="wb-grad">ONE SESSION.</span></h2>
          <p className="wb-lead">Join our Friday live webinar and take another step towards becoming a more knowledgeable trader.</p>
          <div className="wb-cta-time">EVERY {webinarConfig.day.toUpperCase()} | {webinarConfig.time} IST</div>
          <MeetButton className="wb-btn-primary wb-btn-lg">
            <Icon.Meet className="wb-ico" /> JOIN OUR NEXT WEBINAR
          </MeetButton>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Modals                                                              */
/* ------------------------------------------------------------------ */
function Modal({ onClose, children, label }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="wb-modal" role="dialog" aria-modal="true" aria-label={label} onClick={onClose}>
      <div className="wb-modal-box" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="wb-modal-close" onClick={onClose} aria-label="Close"><Icon.Close /></button>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function Webinar() {
  const now = useNow(5000);
  const { isLive } = getSession(now);
  const [video, setVideo] = useState(null);
  const [photo, setPhoto] = useState(null);
  const closeVideo = useCallback(() => setVideo(null), []);
  const closePhoto = useCallback(() => setPhoto(null), []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (photo === null) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") setPhoto((p) => (p + 1) % webinarGallery.length);
      if (e.key === "ArrowLeft") setPhoto((p) => (p - 1 + webinarGallery.length) % webinarGallery.length);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [photo]);

  return (
    <main className="wb-page">
      <PageBackground />
      <div className="wb-content">
        <WebinarHero isLive={isLive} />
        <UpcomingWebinar />
        <WebinarVideos onOpen={setVideo} />
        <WebinarGallery onOpen={setPhoto} />
        <WebinarBenefits />
        <WebinarCTA />
      </div>

      {video && (
        <Modal onClose={closeVideo} label={video.title}>
          <video className="wb-modal-video" src={video.src} poster={video.poster} controls autoPlay playsInline />
          <p className="wb-modal-title">{video.title}</p>
        </Modal>
      )}

      {photo !== null && webinarGallery[photo] && (
        <Modal onClose={closePhoto} label="Photo preview">
          <img className="wb-modal-img" src={webinarGallery[photo].src} alt={webinarGallery[photo].alt} />
          {webinarGallery.length > 1 && (
            <div className="wb-modal-nav">
              <button type="button" onClick={() => setPhoto((photo - 1 + webinarGallery.length) % webinarGallery.length)} aria-label="Previous photo">‹</button>
              <span>{photo + 1} / {webinarGallery.length}</span>
              <button type="button" onClick={() => setPhoto((photo + 1) % webinarGallery.length)} aria-label="Next photo">›</button>
            </div>
          )}
        </Modal>
      )}
    </main>
  );
}