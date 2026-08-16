import React from 'react';
import './About.css';
import heroMainImg from './assets/zonexoff.png';
import storyBgImg from './assets/zonex-2.png';
import missionBgImg from './assets/zonex-3.png';

export default function About() {
  return (
    <div className="about-container">
      {/* Top Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <div className="hero-badge-tag">EST. 2018 • INSTITUTIONAL GRADE</div>
          <h1>
            Democratizing <br />
            <span>Institutional</span> <br />
            Knowledge
          </h1>
          <p>
            We believe that elite financial education shouldn't be gated behind Wall Street 
            institutions. Zonex Edu Hub bridges the gap, providing retail traders with the 
            tools, strategies, and mentorship previously reserved for the professionals.
          </p>
          <div className="hero-actions">
            <button className="explore-btn">Explore Our Curriculum</button>
            <div className="hero-stat-pill">
              <span className="dot"></span> 50k+ Active Traders Globally
            </div>
          </div>
        </div>

        <div className="about-hero-image-wrapper">
          <div className="image-glow-backdrop"></div>
          <img 
            src={heroMainImg} 
            alt="Office workspace" 
            className="hero-main-img"
          />
        </div>
      </section>

      {/* Foundation Section */}
      <section className="foundation-section">
        <div className="foundation-header">
          <span className="section-tag">WHO WE ARE</span>
          <h2>Our Foundation</h2>
          <p>Built by industry veterans, designed for the next generation of market leaders.</p>
        </div>

        <div className="foundation-grid">
          {/* Our Story Card */}
          <div className="card story-card" style={{ backgroundImage: `url(${storyBgImg})` }}>
            <div className="card-overlay"></div>
            <div className="card-content-box">
              <div className="card-icon-wrapper">📖</div>
              <h3>Our Story</h3>
              <p>
                Zonex EduHub is a premier financial education institute based in Palarivattom, Kochi, dedicated to empowering individuals with the knowledge and skills needed to succeed in the world of trading.
At Zonex, we simplify global trading through structured training in Forex, Stock, and Crypto markets, designed for learners at any level.
Our mission is to create confident, independent traders who can clear funded account challenges and build long-term trading careers.
With a unique blend of expert mentorship, live trading sessions, and real-time market insights, we ensure every student gains hands-on experience and practical knowledge.
Whether you're learning online or at our Kochi center, you'll gain access to exclusive community groups, lifetime learning resources, and personalized guidance throughout your journey.
Join Zonex EduHub and take your first step toward financial freedom-right from the heart of Kochi.
              </p>
            </div>
          </div>

          {/* The Vision Card */}
          <div className="card vision-card">
            <div className="vision-content">
              <div className="card-icon-wrapper">🎯</div>
              <h3>The Vision</h3>
              <p>
                To create a global standard for retail financial education, where success is measured by 
                consistency and risk mitigation, not just raw returns. We empower traders to navigate volatility with mathematical confidence.
              </p>
            </div>
          </div>

          {/* The Mission Card */}
          <div className="card mission-card" style={{ backgroundImage: `url(${missionBgImg})` }}>
            <div className="card-overlay"></div>
            <div className="card-content-box">
              <div className="card-icon-wrapper">⚡</div>
              <h3>The Mission</h3>
              <p>
                Equip ambitious individuals with institutional-grade strategies, cutting-edge analytical tools, 
                and unparalleled mentorship to navigate modern financial markets confidently and profitably.
              </p>
            </div>
          </div>

          {/* Statistics Card */}
          <div className="card stats-card">
            <div className="stats-inner-grid">
              <div className="stat-item">
                <h4>2000+</h4>
                <span> STUDENTS</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <h4>10+</h4>
                <span>GLOBAL MENTORS</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <h4>1M+</h4>
                <span>PROP CAPITAL MANAGED</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}