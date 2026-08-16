import React from 'react';
import './Courses.css';

export default function Courses() {
  const handleEnrollClick = (e) => {
    e.preventDefault();
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="courses" className="courses-section">
      <div className="courses-container">
        
        {/* Header */}
        <div className="courses-header">
          <span className="section-tag">ELITE TRAINING PROGRAMS</span>
          <h2>Our Courses</h2>
          <p>
            Master the financial markets with our comprehensive, expert-led training programs. From foundational concepts to advanced algorithmic trading strategies.
          </p>
          <div className="header-underline"></div>
        </div>

        {/* Courses Grid Layout */}
        <div className="courses-grid">
          
          {/* Card 1: Basic Strategic Course */}
          <div className="course-card">
            <div className="card-top">
              <span className="badge foundational">Foundational</span>
              <h3>FOREX/STOCK MARKET BASIC STRATEGIC COURSE</h3>
              <div className="course-meta">
                <div className="meta-block">
                  <span className="meta-label">DURATION</span>
                  <span className="meta-value">⏱️ 1 Month</span>
                </div>
                <div className="meta-block">
                  <span className="meta-label">FEE</span>
                  <span className="meta-value">💰 5,000/-</span>
                </div>
              </div>
            </div>

            <div className="card-body">
              <span className="topics-title">Key Topics:</span>
              <ul className="topics-list">
                <li><span className="check-icon">✓</span> Introduction to Forex & Stock Market</li>
                <li><span className="check-icon">✓</span> Currency Pairs</li>
                <li><span className="check-icon">✓</span> Fundamental / Technical Analysis</li>
                <li><span className="check-icon">✓</span> Trading Strategy</li>
                <li><span className="check-icon">✓</span> Psychology & Risk Management</li>
                <li><span className="check-icon">✓</span> Live Trading Sessions</li>
                <li><span className="check-icon">✓</span> Final Assessment / Certification</li>
              </ul>
            </div>

            <div className="card-footer">
              <a href="#contact" onClick={handleEnrollClick} className="enroll-btn">Enroll Now</a>
            </div>
          </div>

          {/* Card 2: Advanced Strategic Course */}
          <div className="course-card featured-card">
            <div className="card-top">
              <span className="badge advanced">Advanced</span>
              <h3>FOREX/STOCK MARKET ADVANCED STRATEGIC COURSE</h3>
              <div className="course-meta">
                <div className="meta-block">
                  <span className="meta-label">DURATION</span>
                  <span className="meta-value">⏱️ 1 Month</span>
                </div>
                <div className="meta-block">
                  <span className="meta-label">FEE</span>
                  <span className="meta-value">💰 15,000/-</span>
                </div>
              </div>
            </div>

            <div className="card-body">
              <span className="topics-title">Key Topics:</span>
              <p className="topics-subtitle">Advanced versions of the basic topics, plus:</p>
              <ul className="topics-list">
                <li><span className="check-icon">📈</span> Position Sizing</li>
                <li><span className="check-icon">📊</span> Introduction to Derivatives/Options/Futures</li>
                <li><span className="check-icon">🔗</span> System Chains</li>
                <li><span className="check-icon">⚡</span> Strategy Building</li>
              </ul>
            </div>

            <div className="card-footer">
              <a href="#contact" onClick={handleEnrollClick} className="enroll-btn featured-btn">Enroll Now</a>
            </div>
          </div>

          {/* Right Column (Stacked Cards) */}
          <div className="right-stacked-column">
            
            {/* Card 3: Standard Mentorship */}
            <div className="course-card-small standard-card">
              <div className="small-card-header">
                <span className="badge standard-badge">Mentorship - Standard</span>
              </div>
              <h4>FOREX & STOCK MARKET PERSONAL MENTORSHIP COURSE</h4>
              <div className="course-meta-small">
                <div>
                  <span className="meta-label">DURATION</span>
                  <p className="meta-value-small">2 Months</p>
                </div>
                <div>
                  <span className="meta-label">FEE</span>
                  <p className="meta-value-small">25,000/-</p>
                </div>
              </div>
              <p className="card-desc">
                Comprehensive curriculum covering both markets with personalized guidance.
              </p>
              <div className="card-footer-small">
                <a href="#contact" onClick={handleEnrollClick} className="enroll-btn-small">Enroll Now</a>
              </div>
            </div>

            {/* Card 4: Pro & Algo Mentorship */}
            <div className="course-card-small pro-card">
              <div className="small-card-header">
                <span className="badge pro-badge">Mentorship - Pro & Algo</span>
              </div>
              <h4>FOREX & STOCK MARKET PERSONAL MENTORSHIP COURSE</h4>
              <div className="course-meta-small">
                <div>
                  <span className="meta-label dark-label">DURATION</span>
                  <p className="meta-value-small">No Fixed Duration</p>
                </div>
                <div>
                  <span className="meta-label dark-label">FEE</span>
                  <p className="meta-value-small">45,000/-</p>
                </div>
              </div>
              <ul className="dark-topics-list">
                <li>✓ Standard mentorship curriculum included</li>
                <li>🤖 Includes 'Algo trading bot handle'</li>
              </ul>
              <div className="card-footer-small">
                <a href="#contact" onClick={handleEnrollClick} className="enroll-btn-small pro-btn">Enroll Now</a>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}