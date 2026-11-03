import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Courses.css';

gsap.registerPlugin(ScrollTrigger);

export default function Courses() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  const handleEnrollClick = (e) => {
    e.preventDefault();

    const element = document.getElementById('contact');

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  /* =========================================================
     SAFE CANVAS BACKGROUND
     ========================================================= */
  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;

    if (!canvas || !section) return;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let time = 0;
    let destroyed = false;

    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const resizeCanvas = () => {
      if (!canvas || !section || destroyed) return;

      const rect = section.getBoundingClientRect();

      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(section.scrollHeight));

      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });

    resizeObserver.observe(section);

    const particleCount = reduceMotion
      ? 0
      : isMobile
        ? 12
        : 30;

    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * (isMobile ? 0.15 : 0.3),
      vy: (Math.random() - 0.5) * (isMobile ? 0.15 : 0.3),
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.3 + 0.08,
    }));

    const tickers = [
      {
        text:
          'EUR/USD +0.0024 • GBP/USD -0.0011 • USD/JPY +0.15 • XAU/USD +4.20 • BTC/USD +320.00',
        x: 0,
        y: height * 0.15,
        speed: 0.25,
      },
      {
        text:
          'AUD/USD +0.0008 • NZD/USD +0.0003 • USD/CAD -0.0015 • ETH/USD +18.50 • ICT/SMC EDGE',
        x: width * 0.4,
        y: height * 0.55,
        speed: 0.2,
      },
      {
        text:
          'ZONEX TRADING HUB • FINANCIAL FREEDOM • RISK MANAGEMENT • INSTITUTIONAL FLOW',
        x: width * 0.1,
        y: height * 0.88,
        speed: 0.25,
      },
    ];

    const render = () => {
      if (destroyed) return;

      ctx.clearRect(0, 0, width, height);

      /* Background grid */
      const gridSize = isMobile ? 70 : 60;

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.025)';
      ctx.lineWidth = 1;

      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      /* Ticker text */
      ctx.font = '10px monospace';
      ctx.fillStyle = 'rgba(0, 240, 255, 0.06)';

      tickers.forEach((ticker) => {
        ticker.x -= ticker.speed;

        if (ticker.x < -700) {
          ticker.x = width + 50;
        }

        ctx.fillText(ticker.text, ticker.x, ticker.y);
      });

      /* Particles */
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;

        ctx.beginPath();
        ctx.arc(
          particle.x,
          particle.y,
          particle.size,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = `rgba(0, 240, 255, ${particle.alpha})`;
        ctx.fill();
      });

      /* Subtle pulse line */
      if (!isMobile && !reduceMotion) {
        time += 0.01;

        ctx.beginPath();
        ctx.moveTo(0, height * 0.5);

        for (let x = 0; x <= width; x += 20) {
          const sineY =
            Math.sin(x * 0.005 + time) * 15;

          ctx.lineTo(
            x,
            height * 0.5 + sineY
          );
        }

        ctx.strokeStyle = 'rgba(0, 240, 255, 0.025)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      if (!reduceMotion) {
        animationFrameRef.current =
          requestAnimationFrame(render);
      }
    };

    render();

    const handleWindowResize = () => {
      resizeCanvas();
    };

    window.addEventListener(
      'resize',
      handleWindowResize,
      { passive: true }
    );

    window.addEventListener(
      'orientationchange',
      handleWindowResize,
      { passive: true }
    );

    return () => {
      destroyed = true;

      window.removeEventListener(
        'resize',
        handleWindowResize
      );

      window.removeEventListener(
        'orientationchange',
        handleWindowResize
      );

      resizeObserver.disconnect();

      if (animationFrameRef.current) {
        cancelAnimationFrame(
          animationFrameRef.current
        );
      }
    };
  }, []);

  /* =========================================================
     GSAP - SAFE SCROLL ANIMATIONS
     ========================================================= */
  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    let context;
    let refreshTimer;

    const setupAnimations = () => {
      context = gsap.context(() => {
        const header = section.querySelector(
          '.courses-header'
        );

        const tag = section.querySelector(
          '.section-tag'
        );

        const headingLines = section.querySelectorAll(
          '.courses-header h2 .line'
        );

        const description = section.querySelector(
          '.courses-header p'
        );

        const accent = section.querySelector(
          '.header-accent-line'
        );

        const cards = section.querySelectorAll(
          '.course-card'
        );

        const featurePanel = section.querySelector(
          '.courses-feature-panel'
        );

        const ctaStrip = section.querySelector(
          '.courses-cta-strip'
        );

        /* -----------------------------------------
           HEADER
           IMPORTANT:
           opacity starts at 1.
           GSAP is NOT responsible for visibility.
        ----------------------------------------- */

        if (header) {
          gsap.fromTo(
            tag,
            {
              y: 15,
            },
            {
              y: 0,
              duration: 0.5,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: header,
                start: 'top 85%',
                once: true,
              },
            }
          );

          if (headingLines.length) {
            gsap.fromTo(
              headingLines,
              {
                y: 20,
              },
              {
                y: 0,
                duration: 0.7,
                stagger: 0.12,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: header,
                  start: 'top 85%',
                  once: true,
                },
              }
            );
          }

          if (description) {
            gsap.fromTo(
              description,
              {
                y: 12,
              },
              {
                y: 0,
                duration: 0.5,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: header,
                  start: 'top 85%',
                  once: true,
                },
              }
            );
          }

          if (accent) {
            gsap.fromTo(
              accent,
              {
                scaleX: 0,
              },
              {
                scaleX: 1,
                duration: 0.8,
                ease: 'power2.inOut',
                scrollTrigger: {
                  trigger: header,
                  start: 'top 85%',
                  once: true,
                },
              }
            );
          }
        }

        /* -----------------------------------------
           COURSE CARDS
           Never hide cards with opacity.
        ----------------------------------------- */

        cards.forEach((card, index) => {
          gsap.fromTo(
            card,
            {
              y: 30,
            },
            {
              y: 0,
              duration: 0.65,
              delay: index * 0.04,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 92%',
                once: true,
              },
            }
          );
        });

        /* -----------------------------------------
           FEATURE PANEL
        ----------------------------------------- */

        if (featurePanel) {
          gsap.fromTo(
            featurePanel,
            {
              y: 25,
            },
            {
              y: 0,
              duration: 0.7,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: featurePanel,
                start: 'top 92%',
                once: true,
              },
            }
          );
        }

        /* -----------------------------------------
           CTA
        ----------------------------------------- */

        if (ctaStrip) {
          gsap.fromTo(
            ctaStrip,
            {
              y: 25,
              scale: 0.99,
            },
            {
              y: 0,
              scale: 1,
              duration: 0.7,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: ctaStrip,
                start: 'top 94%',
                once: true,
              },
            }
          );
        }

        /* Refresh after layout */
        refreshTimer = window.setTimeout(() => {
          ScrollTrigger.refresh();
        }, 150);
      }, section);
    };

    /*
      Wait until browser has painted the page.
      This helps real mobile browsers calculate
      the correct section positions.
    */
    const rafId = requestAnimationFrame(() => {
      setupAnimations();
    });

    return () => {
      cancelAnimationFrame(rafId);

      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      if (context) {
        context.revert();
      }
    };
  }, []);

  return (
    <section
      id="courses"
      className="courses-section"
      ref={sectionRef}
    >
      <canvas
        ref={canvasRef}
        className="courses-bg-canvas"
        aria-hidden="true"
      />

      <div className="courses-container">

        {/* ================= HEADER ================= */}

        <div className="courses-header">
          <span className="section-tag">
            COURSES & PROGRAMS
          </span>

          <h2>
            <span className="line">
              MASTER THE MARKET.
            </span>

            <span className="line cyan-text">
              BUILD YOUR EDGE.
            </span>
          </h2>

          <p>
            Structured market education designed to take
            you from foundational concepts to advanced
            institutional strategies and personalized
            1-on-1 mentorship.
          </p>

          <div className="header-accent-line"></div>
        </div>

        {/* ================= COURSES ================= */}

        <div className="courses-grid">

          {/* COURSE 01 */}

          <div className="course-card card-theme-green">
            <div className="card-bg-number">01</div>
            <div className="card-scanline"></div>

            <div className="card-header-meta">
              <span className="category-label theme-badge">
                FOUNDATIONAL
              </span>

              <span className="course-code">
                [ COURSE 01 ]
              </span>
            </div>

            <h3 className="card-title">
              BASIC STRATEGIC COURSE
            </h3>

            <div className="card-pricing-block">
              <div className="price-tag">
                <span className="currency">₹</span>
                5,000
              </div>

              <div className="duration-badge">
                <span className="badge-icon">⏱</span>
                2 Month
              </div>
            </div>

            <p className="card-description">
              Build a strong foundation in market
              structure, trading concepts, technical
              analysis, and strategic thinking.
            </p>

            <div className="topics-container">
              <span className="topics-heading">
                MODULE INCLUDES
              </span>

              <ul className="topics-list">
                <li>
                  <span className="bullet-node"></span>
                  Market Fundamentals
                </li>

                <li>
                  <span className="bullet-node"></span>
                  Technical Analysis
                </li>

                <li>
                  <span className="bullet-node"></span>
                  Market Structure
                </li>

                <li>
                  <span className="bullet-node"></span>
                  Risk Management
                </li>

                <li>
                  <span className="bullet-node"></span>
                  Trading Psychology
                </li>
              </ul>
            </div>

            <div className="card-footer">
              <a
                href="#contact"
                onClick={handleEnrollClick}
                className="cta-button"
              >
                <span>EXPLORE COURSE</span>
                <span className="cta-arrow">→</span>
              </a>
            </div>
          </div>

          {/* COURSE 02 */}

          <div className="course-card card-theme-cyan">
            <div className="card-bg-number">02</div>
            <div className="card-scanline"></div>

            <div className="card-header-meta">
              <span className="category-label theme-badge">
                ADVANCED
              </span>

              <span className="course-code">
                [ COURSE 02 ]
              </span>
            </div>

            <h3 className="card-title">
              ADVANCED STRATEGIC COURSE
            </h3>

            <div className="card-pricing-block">
              <div className="price-tag">
                <span className="currency">₹</span>
                15,000
              </div>

              <div className="duration-badge">
                <span className="badge-icon">⏱</span>
                2 Month
              </div>
            </div>

            <p className="card-description">
              Develop a deeper understanding of advanced
              market concepts, strategy development, and
              practical trading execution.
            </p>

            <div className="topics-container">
              <span className="topics-heading">
                MODULE INCLUDES
              </span>

              <ul className="topics-list">
                <li>
                  <span className="bullet-node"></span>
                  Advanced Market Structure
                </li>

                <li>
                  <span className="bullet-node"></span>
                  Advanced Technical Analysis
                </li>

                <li>
                  <span className="bullet-node"></span>
                  Strategy Development
                </li>

                <li>
                  <span className="bullet-node"></span>
                  Trade Execution
                </li>

                <li>
                  <span className="bullet-node"></span>
                  Risk & Psychology
                </li>
              </ul>
            </div>

            <div className="card-footer">
              <a
                href="#contact"
                onClick={handleEnrollClick}
                className="cta-button"
              >
                <span>EXPLORE COURSE</span>
                <span className="cta-arrow">→</span>
              </a>
            </div>
          </div>

          {/* COURSE 03 */}

          <div className="course-card card-theme-blue">
            <div className="card-bg-number">03</div>
            <div className="card-scanline"></div>

            <div className="card-header-meta">
              <span className="category-label theme-badge">
                COMPREHENSIVE
              </span>

              <span className="course-code">
                [ COURSE 03 ]
              </span>
            </div>

            <h3 className="card-title">
              360° MASTER COURSE
            </h3>

            <div className="card-pricing-block">
              <div className="price-tag glow-price">
                <span className="currency">₹</span>
                25,000
              </div>

              <div className="duration-badge highlight-duration">
                <span className="badge-icon">♾️</span>
                Lifetime Access
              </div>
            </div>

            <p className="card-description">
              A complete end-to-end multi-market program
              focusing on Forex, Stock, and Crypto markets
              with institutional strategies and funded
              accounts.
            </p>

            <div className="topics-container">
              <span className="topics-heading">
                COURSE FEATURES & INCLUDES
              </span>

              <ul className="topics-list">
                <li>
                  <span className="bullet-node"></span>
                  Stock, Forex & Crypto Markets
                </li>

                <li>
                  <span className="bullet-node"></span>
                  Stock & Crypto: Basic Level
                </li>

                <li>
                  <span className="bullet-node"></span>
                  Forex: Basic to Advanced Level
                </li>

                <li>
                  <span className="bullet-node"></span>
                  Strategies: ICT • SMC • MSNR •
                  MSNR + Trendline
                </li>

                <li>
                  <span className="bullet-node"></span>
                  Funded Accounts Provided
                </li>

                <li>
                  <span className="bullet-node"></span>
                  Lifetime Community Access
                </li>
              </ul>
            </div>

            <div className="card-footer">
              <a
                href="#contact"
                onClick={handleEnrollClick}
                className="cta-button primary-cta"
              >
                <span>JOIN 360° COURSE</span>
                <span className="cta-arrow">→</span>
              </a>
            </div>
          </div>

          {/* COURSE 04 */}

          <div className="course-card card-theme-rose">
            <div className="card-bg-number">04</div>
            <div className="card-scanline"></div>

            <div className="card-header-meta">
              <span className="category-label theme-badge">
                PERSONALISED
              </span>

              <span className="course-code">
                [ COURSE 04 ]
              </span>
            </div>

            <h3 className="card-title">
              FOREX MARKETING
              <br />
              <span className="highlight-text">
                1-TO-1 MENTORSHIP
              </span>
            </h3>

            <div className="card-pricing-block">
              <div className="price-tag glow-price">
                <span className="currency">₹</span>
                30,000
              </div>

              <div className="duration-badge highlight-duration">
                <span className="badge-icon">⚡</span>
                1-on-1 Mentorship
              </div>
            </div>

            <p className="card-description">
              A personalized 1-to-1 mentorship experience
              focused on understanding the forex market,
              developing a structured approach, and
              receiving direct guidance.
            </p>

            <div className="topics-container">
              <span className="topics-heading">
                MENTORSHIP INCLUDES
              </span>

              <ul className="topics-list">
                <li>
                  <span className="bullet-node"></span>
                  Personalised 1-to-1 Guidance
                </li>

                <li>
                  <span className="bullet-node"></span>
                  Forex Market Education
                </li>

                <li>
                  <span className="bullet-node"></span>
                  Strategy Development
                </li>

                <li>
                  <span className="bullet-node"></span>
                  Trade Analysis & Risk Management
                </li>

                <li>
                  <span className="bullet-node"></span>
                  Trading Psychology & Direct Support
                </li>
              </ul>
            </div>

            <div className="card-footer">
              <a
                href="#contact"
                onClick={handleEnrollClick}
                className="cta-button primary-cta"
              >
                <span>JOIN MENTORSHIP</span>
                <span className="cta-arrow">→</span>
              </a>
            </div>
          </div>

          {/* COURSE 05 */}

          <div className="course-card card-theme-gold ultra-premium">
            <div className="card-bg-number">05</div>
            <div className="card-scanline"></div>

            <div className="card-header-meta">
              <span className="category-label theme-badge">
                FLAGSHIP
              </span>

              <span className="course-code">
                [ COURSE 05 ]
              </span>
            </div>

            <h3 className="card-title">
              FINANCIAL INDEPENDENCE{' '}
              <span className="highlight-text">
                COURSE
              </span>
            </h3>

            <div className="card-pricing-block">
              <div className="price-tag glow-price">
                <span className="currency">₹</span>
                50,000
              </div>

              <div className="duration-badge highlight-duration">
                <span className="badge-icon">👑</span>
                Complete Mastery
              </div>
            </div>

            <p className="card-description">
              The ultimate financial freedom program
              covering all financial markets from basic to
              advanced levels with all proprietary
              strategies included.
            </p>

            <div className="topics-container">
              <span className="topics-heading">
                PROGRAM HIGHLIGHTS
              </span>

              <ul className="topics-list">
                <li>
                  <span className="bullet-node"></span>
                  All Markets: Stock, Forex & Crypto
                </li>

                <li>
                  <span className="bullet-node"></span>
                  All Levels: Basic to Advanced Mastery
                </li>

                <li>
                  <span className="bullet-node"></span>
                  All Strategies Provided for All Markets
                </li>

                <li>
                  <span className="bullet-node"></span>
                  No Fixed Duration (Learn at Your Pace)
                </li>

                <li>
                  <span className="bullet-node"></span>
                  Lifetime Community Access & Updates
                </li>
              </ul>
            </div>

            <div className="card-footer">
              <a
                href="#contact"
                onClick={handleEnrollClick}
                className="cta-button primary-cta"
              >
                <span>ENROLL NOW</span>
                <span className="cta-arrow">→</span>
              </a>
            </div>
          </div>

          {/* COURSE 06 */}

          <div className="course-card card-theme-purple night-class-card">
            <div className="card-bg-number">06</div>
            <div className="card-scanline"></div>

            <div className="card-header-meta">
              <span className="category-label theme-badge">
                FLEXIBLE HOURS
              </span>

              <span className="course-code">
                [ SPECIAL ]
              </span>
            </div>

            <h3 className="card-title">
              NIGHT CLASS{' '}
              <span className="highlight-text">
                (360° COURSE)
              </span>
            </h3>

            <div className="card-pricing-block">
              <div className="price-tag glow-price">
                360°
                <span className="sub-price">
                  Program
                </span>
              </div>

              <div className="duration-badge highlight-duration">
                <span className="badge-icon">🌙</span>
                Night Schedule
              </div>
            </div>

            <p className="card-description">
              Designed specifically for working
              professionals, employees, and full-time
              students who want to master trading after
              standard working hours.
            </p>

            <div className="topics-container">
              <span className="topics-heading">
                SCHEDULE & DETAILS
              </span>

              <ul className="topics-list">
                <li>
                  <span className="bullet-node"></span>
                  Includes Full 360° Course Curriculum
                </li>

                <li>
                  <span className="bullet-node"></span>
                  Tailored for Employees & Students
                </li>

                <li>
                  <span className="bullet-node"></span>
                  Convenient Late Evening / Night Batches
                </li>

                <li>
                  <span className="bullet-node"></span>
                  Live Interactive Practice Sessions
                </li>

                <li>
                  <span className="bullet-node"></span>
                  Lifetime Community Access
                </li>
              </ul>
            </div>

            <div className="card-footer">
              <a
                href="#contact"
                onClick={handleEnrollClick}
                className="cta-button"
              >
                <span>JOIN NIGHT BATCH</span>
                <span className="cta-arrow">→</span>
              </a>
            </div>
          </div>

          {/* ================= FEATURE PANEL ================= */}

          <div className="courses-feature-panel">
            <div className="feature-panel-grid"></div>

            <div className="feature-content">

              <div className="terminal-header">
                <span className="terminal-dot red"></span>
                <span className="terminal-dot yellow"></span>
                <span className="terminal-dot green"></span>

                <span className="terminal-title">
                  ZONEX // MENTORSHIP DASHBOARD
                </span>
              </div>

              <div className="terminal-body">

                <div className="metric-row">
                  <span className="metric-label">
                    TRADING SYSTEM
                  </span>

                  <span className="metric-val">
                    INSTITUTIONAL EDGE
                  </span>
                </div>

                <div className="metric-row">
                  <span className="metric-label">
                    MENTORSHIP MODE
                  </span>

                  <span className="metric-val cyan">
                    1-ON-1 DIRECT
                  </span>
                </div>

                <div className="metric-row">
                  <span className="metric-label">
                    EXECUTION ACCURACY
                  </span>

                  <span className="metric-val">
                    OPTIMIZED
                  </span>
                </div>

                <div className="chart-preview-graphic">
                  <svg
                    viewBox="0 0 300 100"
                    className="svg-chart"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient
                        id="chartGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="rgba(0, 240, 255, 0.35)"
                        />

                        <stop
                          offset="100%"
                          stopColor="rgba(0, 240, 255, 0)"
                        />
                      </linearGradient>
                    </defs>

                    <path
                      d="M0 80 Q40 70,80 40 T160 50 T240 20 T300 10 L300 100 L0 100 Z"
                      fill="url(#chartGrad)"
                    />

                    <path
                      d="M0 80 Q40 70,80 40 T160 50 T240 20 T300 10"
                      fill="none"
                      stroke="#00f0ff"
                      strokeWidth="2"
                    />

                    <circle
                      cx="240"
                      cy="20"
                      r="4"
                      fill="#00f0ff"
                      className="ping-dot"
                    />
                  </svg>
                </div>

                <div className="status-footer">
                  <span className="live-indicator"></span>

                  <span className="status-text">
                    LIVE MENTORSHIP & NIGHT SLOTS OPEN
                  </span>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* ================= BOTTOM CTA ================= */}

        <div className="courses-cta-strip">
          <div className="cta-strip-bg"></div>

          <div className="cta-strip-content">

            <span className="cta-tag">
              ELEVATE YOUR TRADING
            </span>

            <h3 className="cta-heading">
              READY TO TAKE YOUR TRADING EDUCATION FURTHER?
            </h3>

            <p className="cta-subtext">
              Build your knowledge. Develop your strategy.
              Trade with greater confidence.
            </p>

            <a
              href="#contact"
              onClick={handleEnrollClick}
              className="cta-strip-btn"
            >
              <span>START YOUR JOURNEY</span>

              <span className="btn-icon">
                →
              </span>
            </a>

          </div>
        </div>

      </div>
    </section>
  );
}