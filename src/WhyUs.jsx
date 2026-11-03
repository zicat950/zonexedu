import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './WhyUs.css';
import bannerBgImg from './assets/zonex-office.png';

export default function WhyUs() {
  const sectionRef = useRef(null);
  const heroRef = useRef(null);
  const gridRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const headingText = "Why Traders Choose ZONEX";
  const words = headingText.split(" ");

  const features = [
    {
      id: "01",
      code: "SKILL_SYS // 01",
      icon: "🎓",
      title: "Career-Oriented Skillset",
      description: "Learn a globally in-demand, high-income skill alongside your degree with practical market insights.",
      tag: "FEATURED CORE",
      featured: true,
      phase: "LEARN"
    },
    {
      id: "02",
      code: "TRD_LAB // 02",
      icon: "📊",
      title: "Practical Training",
      description: "Live trading sessions, real-time market analysis & direct mentorship from experienced prop traders.",
      tag: "REAL-TIME",
      featured: false,
      phase: "PRACTICE"
    },
    {
      id: "03",
      code: "CAP_ALLOC // 03",
      icon: "💼",
      title: "Funding Opportunity",
      description: "Our structured training equips you to pass funded account evaluations to trade capital at scale.",
      tag: "PROP FUNDING",
      featured: false,
      phase: "EXECUTE"
    },
    {
      id: "04",
      code: "SCHED_MOD // 04",
      icon: "⏰",
      title: "Flexible Schedule",
      description: "Seamlessly fits your academic routine. Access live or recorded modules online & offline.",
      tag: "ADAPTIVE",
      featured: false,
      phase: "ADAPT"
    },
    {
      id: "05",
      code: "COMM_NET // 05",
      icon: "👥",
      title: "Community Access",
      description: "Direct lifetime access to the elite Zonex network across Discord, WhatsApp & private Telegram channels.",
      tag: "NETWORK",
      featured: false,
      phase: "GROW"
    },
    {
      id: "06",
      code: "CERT_VERIF // 06",
      icon: "🏅",
      title: "Recognized Certification",
      description: "Receive a cryptographically verified certificate of trading proficiency upon completion.",
      tag: "CREDENTIAL",
      featured: false,
      phase: "VALIDATE"
    }
  ];

  // Mouse Parallax & Spotlight Tracker for desktop
  const handleMouseMove = (e) => {
    if (window.innerWidth < 1024) return;
    const { clientX, clientY } = e;
    setMousePos({ x: clientX, y: clientY });

    if (heroRef.current) {
      const moveX = (clientX - window.innerWidth / 2) * 0.015;
      const moveY = (clientY - window.innerHeight / 2) * 0.015;
      heroRef.current.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    }
  };

  // Scroll Intersection Observer for Entrance Reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.12 }
    );

    const animElements = sectionRef.current.querySelectorAll('.reveal-on-scroll');
    animElements.forEach((el) => observer.observe(el));

    return () => {
      animElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Spotlight position on card hover
  const handleCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <section 
      id="why-us" 
      className="why-us-section" 
      ref={sectionRef} 
      onMouseMove={handleMouseMove}
    >
      {/* Background Animated Trading Grid & Floating Lights */}
      <div className="bg-trading-grid"></div>
      <div className="bg-radial-cyan"></div>
      <div className="bg-candlestick-graphics">
        <svg viewBox="0 0 1000 400" className="chart-svg-bg" preserveAspectRatio="none">
          <path d="M 0 300 Q 250 200, 500 250 T 1000 100" fill="none" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="2" />
          <path d="M 0 350 Q 300 150, 600 200 T 1000 50" fill="none" stroke="rgba(2, 132, 199, 0.08)" strokeWidth="1" strokeDasharray="6 6" />
        </svg>
      </div>

      <div className="why-us-container">
        
        {/* HERO / INTRO SECTION */}
        <div className="why-us-hero reveal-on-scroll" ref={heroRef}>
          <div className="eyebrow-badge">
            <span className="pulse-dot"></span>
            <span className="mono-text">WHY ZONEX EDUHUB</span>
          </div>

          <h1 className="hero-heading">
            {words.map((word, idx) => (
              <span 
                key={idx} 
                className={`word-span ${word === 'Traders' || word === 'ZONEX' ? 'gradient-word' : ''}`}
                style={{ animationDelay: `${0.1 + idx * 0.12}s` }}
              >
                {word}&nbsp;
              </span>
            ))}
          </h1>

          <p className="hero-subtitle">
            Engineered for high-performing students and aspiring market analysts. We bridge academic theory with institutional trading discipline, practical funding, and real market capital.
          </p>

          <div className="tech-stat-strip">
            <div className="stat-pill"><span className="mono-dim">COMMUNITY:</span> <strong>5,000+</strong></div>
            <div className="stat-pill"><span className="mono-dim">FUNDED PASS:</span> <strong>88%</strong></div>
            <div className="stat-pill"><span className="mono-dim">MENTORSHIP:</span> <strong>1-ON-1</strong></div>
          </div>
        </div>

        {/* FEATURE CONNECTION PIPELINE BADGE */}
        <div className="connection-pipeline reveal-on-scroll">
          <div className="pipe-step active">LEARN <span className="arrow">→</span></div>
          <div className="pipe-step active">PRACTICE <span className="arrow">→</span></div>
          <div className="pipe-step">EXECUTE <span className="arrow">→</span></div>
          <div className="pipe-step">GROW</div>
          <div className="pipe-line-bg">
            <div className="pipe-pulse-node"></div>
          </div>
        </div>

        {/* WHY US FEATURES - ASYMMETRIC PREMIUM LAYOUT */}
        <div className="features-asymmetric-grid" ref={gridRef}>
          {features.map((item, index) => (
            <div 
              key={index}
              className={`feature-card-module ${item.featured ? 'featured-main' : 'standard-module'} reveal-on-scroll`}
              style={{ transitionDelay: `${0.1 + index * 0.08}s` }}
              onMouseMove={handleCardMouseMove}
            >
              {/* Card Spotlight Background Overlay */}
              <div className="card-spotlight"></div>
              <div className="card-scanline"></div>

              {/* Top Header Row */}
              <div className="card-top-bar">
                <span className="card-code-mono">{item.code}</span>
                <span className="card-phase-tag">{item.tag}</span>
              </div>

              {/* Icon & Title */}
              <div className="card-body">
                <div className="feature-icon-wrapper">
                  <span className="icon-emoji">{item.icon}</span>
                  <div className="icon-glow-ring"></div>
                </div>

                <h3 className="card-title">{item.title}</h3>
                <p className="card-desc">{item.description}</p>
              </div>

              {/* Bottom Interactive Line & Number */}
              <div className="card-bottom-bar">
                <div className="progress-track">
                  <div className="progress-fill"></div>
                </div>
                <span className="card-number-index">{item.id}</span>
              </div>
            </div>
          ))}
        </div>

        {/* LARGE CINEMATIC STORY / CTA SECTION */}
        <div className="cinematic-cta-wrapper reveal-on-scroll">
          <div 
            className="cinematic-cta-card"
            style={{ backgroundImage: `url(${bannerBgImg})` }}
          >
            <div className="cta-overlay-dark"></div>
            <div className="cta-glow-border"></div>

            <div className="cta-content">
              <div className="cta-badge">
                <span className="cyan-dot"></span> OPEN TO ALL ACADEMIC STREAMS
              </div>

              <h2 className="cta-heading">
                WHETHER YOU'RE STUDYING <br />
                <span className="cyan-gradient-text">FINANCE, COMMERCE, TECH, ARTS OR SCIENCE.</span>
              </h2>

              <p className="cta-subtext">
                The markets do not care about your background—only your execution. Our curriculum is built from the ground up to turn complete beginners into confident, disciplined traders.
              </p>

              {/* PREMIUM CTA BUTTON */}
              <div className="cta-action-area">
                <Link to="/courses" className="premium-tech-btn">
                  <span className="btn-bg-glow"></span>
                  <span className="btn-light-sweep"></span>
                  <span className="btn-text">EXPLORE OUR COURSES</span>
                  <svg className="btn-arrow-svg" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
            </div>

            {/* Corner Decorative Circuit Elements */}
            <div className="corner-tech-bracket top-left"></div>
            <div className="corner-tech-bracket top-right"></div>
            <div className="corner-tech-bracket bottom-left"></div>
            <div className="corner-tech-bracket bottom-right"></div>
          </div>
        </div>

      </div>
    </section>
  );
}