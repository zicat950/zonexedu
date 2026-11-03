import React, { useState, useEffect } from 'react';
import './Mentors.css';
import mentor1Img from './assets/binshad og.png';
import mentor2Img from './assets/nasheed og.png';
import mentor3Img from './assets/mehroof og.png';
import mentor4Img from './assets/miyaan og.png';

export default function Mentors() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedCardIndex, setExpandedCardIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mentorsList = [
    {
      name: 'Binshad K',
      role: 'XAU/USD Specialist & Price Action Lead',
      experience: '6+ Years Experience',
      bio: 'Specialist in price action & Liquidity Grid Strategy.',
      image: mentor1Img,
      stats: { students: '2000+', winRate: '68%', rating: '4.9/5' }
    },
    {
      name: 'Nasheed Km',
      role: 'Chief Mentor & Head Technical Strategist',
      experience: '7+ Years Experience',
      bio: 'Master of Inner Circle Trader (ICT) Concepts & Price Action.',
      image: mentor2Img,
      stats: { students: '1800+', winRate: '70%', rating: '4.7/5' }
    },
    {
      name: 'Mehroof Km',
      role: 'Senior Mentor & Risk Management Lead',
      experience: '5+ Years Experience',
      bio: 'Expert in Market Structure & Macroeconomic Trend Trading.',
      image: mentor3Img,
      stats: { students: '1400+', winRate: '62%', rating: '4.6/5' }
    },
    {
      name: 'Shamil Miyan',
      role: 'Trendline Specialist & Psychology Coach',
      experience: '5+ Years Experience',
      bio: 'Advanced Order Flow, MSNR + Trendline Confluence Expert.',
      image: mentor4Img,
      stats: { students: '1200+', winRate: '59%', rating: '4.6/5' }
    },
    
  ];

  const visibleItems = isMobile ? 1 : 3;
  const maxIndex = Math.max(0, mentorsList.length - visibleItems);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const toggleMobileDetails = (index) => {
    if (isMobile) {
      setExpandedCardIndex(expandedCardIndex === index ? null : index);
    }
  };

  return (
    <section className="mentors-section">
      {/* Futuristic Grid & Ambient Particle Background */}
      <div className="futuristic-grid-bg"></div>
      <div className="ambient-glow glow-top-left"></div>
      <div className="ambient-glow glow-center-radial"></div>
      <div className="ambient-glow glow-bottom-right"></div>
      
      {/* Decorative Technical Lines & Shapes */}
      <div className="tech-line tech-line-1"></div>
      <div className="tech-line tech-line-2"></div>
      <div className="tech-shape shape-left"></div>
      <div className="tech-shape shape-right"></div>

      <div className="mentors-container">
        
        {/* Header & About Section */}
        <div className="mentors-header">
          <div className="badge-wrapper">
            <span className="section-tag-futuristic">ELITE LEADERSHIP</span>
          </div>
          
          <h2 className="main-futuristic-heading">
            Our <span className="text-cyan-gradient">Expert</span> Mentors
          </h2>
          
          <div className="about-mentors-block">
            <p className="about-mentors-text">
              Our mentorship team brings together industry-leading technical strategists, 
              institutional price action specialists, and risk management coaches. From mastering 
              XAU/USD liquidity traps and ICT algorithms to executing macroeconomic order flows, 
              our mentors guide retail traders step-by-step toward consistent, institutional-grade profitability.
            </p>
          </div>
          
          {/* Cyber Line Divider */}
          <div className="cyber-divider">
            <div className="cyber-cap left"></div>
            <div className="cyber-line"></div>
            <div className="cyber-cap right"></div>
          </div>
        </div>

        {/* Carousel Wrapper */}
        <div className="mentors-carousel-wrapper">
          <button className="carousel-btn prev-btn" onClick={prevSlide} aria-label="Previous Slide">
            ‹
          </button>

          <div className="mentors-track-container">
            <div 
              className="mentors-track" 
              style={{ 
                transform: `translateX(-${currentIndex * (100 / visibleItems)}%)` 
              }}
            >
              {mentorsList.map((mentor, index) => {
                const isExpanded = expandedCardIndex === index;

                return (
                  <div 
                    className={`mentor-card ${isExpanded ? 'mobile-expanded' : ''}`} 
                    key={index}
                    style={{ animationDelay: `${index * 0.12}s` }}
                  >
                    <div className="mentor-image-wrapper">
                      <div className="cyber-frame-border"></div>
                      <div className="mentor-scan-effect"></div>
                      <div className="mentor-img-ring">
                        <img src={mentor.image} alt={mentor.name} className="mentor-img" />
                      </div>
                      <span className="mentor-exp-badge">{mentor.experience}</span>
                    </div>
                    
                    <div className="mentor-content">
                      <h3>{mentor.name}</h3>
                      <div className="name-cyan-line"></div>

                      {/* Mobile Action Toggle Button */}
                      {isMobile && (
                        <button 
                          className="mobile-toggle-btn"
                          onClick={() => toggleMobileDetails(index)}
                        >
                          {isExpanded ? 'Hide Details ▲' : 'View Details ▼'}
                        </button>
                      )}
                      
                      <div className="mentor-collapsible-details">
                        <span className="mentor-role">{mentor.role}</span>
                        <p className="mentor-bio">{mentor.bio}</p>

                        <div className="mentor-stats">
                          <div className="stat-box">
                            <span className="stat-num">{mentor.stats.students}</span>
                            <span className="stat-label">Students</span>
                          </div>
                          <div className="stat-box">
                            <span className="stat-num">{mentor.stats.winRate}</span>
                            <span className="stat-label">Win Rate</span>
                          </div>
                          <div className="stat-box">
                            <span className="stat-num">{mentor.stats.rating}</span>
                            <span className="stat-label">Rating</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button className="carousel-btn next-btn" onClick={nextSlide} aria-label="Next Slide">
            ›
          </button>
        </div>

        {/* Carousel Progress Indicator */}
        <div className="carousel-indicators">
          <div className="indicator-track-futuristic">
            <div 
              className="indicator-thumb-futuristic" 
              style={{ 
                width: `${100 / mentorsList.length}%`, 
                left: `${(currentIndex / mentorsList.length) * 100}%` 
              }}
            ></div>
          </div>
        </div>

      </div>
    </section>
  );
}