import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';
import bgImage from './assets/herobg.png';

const Hero = () => {
  const tickerItems = [
    { symbol: 'ETH / INR', price: '₹3,12,450', change: '+3.21%', positive: true },
    { symbol: 'NIFTY 50', price: '24,320', change: '+1.15%', positive: true },
    { symbol: 'BANK NIFTY', price: '52,800', change: '+0.85%', positive: true },
    { symbol: 'SOL / INR', price: '₹12,850', change: '+8.42%', positive: true },
    { symbol: 'BTC / INR', price: '₹58,24,251', change: '+5.76%', positive: true },
  ];

  return (
    <section 
      className="hero-section" 
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Background Image Dark Overlay */}
      <div className="hero-overlay"></div>

      <div className="hero-content">
        <h1 className="hero-title animate-title">
           <span className="highlight">EMPOWERING FUTURE TRADERS</span> WITH REAL MARKET EDUCATION
        </h1>
        
        <p className="hero-subtitle animate-subtitle">
          Master the financial markets with structured training, live mentorship, and practical experience. Build a career alongside your degree.
        </p>

        <div className="hero-buttons animate-buttons">
          {/* View Live P&L Button */}
          <Link to="/profit" className="btn-pl pulse-glow">
            <span className="pl-icon">📊</span> View Live P&amp;L
          </Link>
          <a href="#courses" className="btn-secondary">
            Explore Courses
          </a>
        </div>
      </div>

      {/* Live Market Ticker Animation */}
      <div className="market-ticker-container">
        <div className="ticker-track">
          {tickerItems.concat(tickerItems).map((item, index) => (
            <div className="ticker-item" key={index}>
              <span className="ticker-symbol">{item.symbol}</span>
              <span className="ticker-price">{item.price}</span>
              <span className={`ticker-change ${item.positive ? 'positive' : 'negative'}`}>
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;