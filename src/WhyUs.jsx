import React from 'react';
import './WhyUs.css';
import bannerBgImg from './assets/zonex-office.png';

export default function WhyUs() {
  const features = [
    {
      icon: '🎓',
      title: 'Career-Oriented Skillset',
      description: 'Learn a globally in-demand, high-income skill alongside your degree.'
    },
    {
      icon: '📊',
      title: 'Practical Training',
      description: 'Live trading sessions, real-time analysis & mentorship from expert traders.'
    },
    {
      icon: '💼',
      title: 'Funding Opportunity',
      description: 'Our training equips you to pass a funded trading account, giving you the chance to trade with real capital.'
    },
    {
      icon: '⏰',
      title: 'Flexible Schedule',
      description: 'Designed to fit within your academic routine - online & offline sessions available.'
    },
    {
      icon: '👥',
      title: 'Community Access',
      description: "Get lifetime access to Zonex's trading community on Discord, WhatsApp & Telegram."
    },
    {
      icon: '🏅',
      title: 'Certification',
      description: 'Receive a recognized certificate on course completion.'
    }
  ];

  const handleJoinClick = (e) => {
    e.preventDefault();
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="why-us" className="why-us-section">
      <div className="why-us-container">
        
        {/* Section Heading */}
        <div className="why-us-header">
          <span className="section-tag">THE ZONEX ADVANTAGE</span>
          <h2>Why Choose Zonex?</h2>
          <div className="header-underline"></div>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="features-grid">
          {features.map((item, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon-box">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom Banner with Background Image */}
        <div 
          className="why-us-banner" 
          style={{ backgroundImage: `url(${bannerBgImg})` }}
        >
          <div className="banner-gradient-overlay"></div>
          <div className="banner-content">
            <span className="banner-tag-badge">OPEN TO ALL STREAMS</span>
            <h2>
              WHETHER YOU'RE STUDYING <br />
              <span className="banner-highlight">FINANCE, COMMERCE, TECH, ARTS OR SCIENCE.</span>
            </h2>
            <p className="banner-tagline">This program is built from the ground up for you.</p>
            <a href="#contact" onClick={handleJoinClick} className="banner-btn">Join the Program</a>
          </div>
        </div>

      </div>
    </section>
  );
}