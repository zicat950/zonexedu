import React from 'react';
import './Mentors.css';
import mentor1Img from './assets/binshad 3.png';
import mentor2Img from './assets/nasheed 2.png';
import mentor3Img from './assets/mehroof 2.png';
import mentor4Img from './assets/miyaan 2.png';
import mentor5Img from './assets/anandhu 2.png';

export default function Mentors() {
  const mentorsList = [
    {
      name: 'Binshad K',
      role: 'Xau/usd specialist/ Liquidity Hunter,PA lead mentor',
      experience: '6+ Years Experience',
      bio: 'Specialist in price action & Liquidity Grid Strategy.',
      image: mentor1Img,
      stats: { students: '2000+', winRate: '78%', rating: '4.9/5' }
    },
    {
      name: 'Nasheed Km',
      role: 'Chief mentor, Head of Technical strategist, EA head',
      experience: '7+ Years Experience',
      bio: 'Master of Inner Circle Trader (ICT) Concepts & Price Action.',
      image: mentor2Img,
      stats: { students: '1800+', winRate: '72%', rating: '4.7/5' }
    },
    {
      name: 'Mehroof Km',
      role: 'Senior Mentor, Risk management specialist ',
      experience: '5+ Years Experience',
      bio: 'Expert in Market Structure & Macroeconomic Trend Trading .',
      image: mentor3Img,
      stats: { students: '1400+', winRate: '66%', rating: '4.6/5' }
    },
    {
      name: 'Shamil Miyan',
      role: 'MSNRTrend line specialist, psychology coach',
      experience: '5+ Years Experience',
      bio: 'Advanced Order Flow, MSNR + Trendline Confluence Expert.',
      image: mentor4Img,
      stats: { students: '1200+', winRate: '69%', rating: '4.6/5' }
    },
    {
      name: 'Anandu',
      role: 'Ict specialist, Discipline specialist',
      experience: '3+ Years Experience',
      bio: 'Trading Psychology and Institutional ICT Risk Frameworks.',
      image: mentor5Img,
      stats: { students: '1000+', winRate: '65%', rating: '4.6/5' }
    }
  ];

  return (
    <section className="mentors-section">
      <div className="mentors-container">
        
        {/* Header */}
        <div className="mentors-header">
          <span className="section-tag">ELITE LEADERSHIP</span>
          <h2>Meet Our Expert Mentors</h2>
          <p>Learn directly from seasoned market professionals who have managed institutional capital and scaled thousands of profitable retail traders.</p>
          <div className="header-underline"></div>
        </div>

        {/* Mentors Grid */}
        <div className="mentors-grid">
          {mentorsList.map((mentor, index) => (
            <div className="mentor-card" key={index}>
              <div className="mentor-image-wrapper">
                <div className="mentor-img-ring">
                  <img src={mentor.image} alt={mentor.name} className="mentor-img" />
                </div>
                <span className="mentor-exp-badge">{mentor.experience}</span>
              </div>
              
              <div className="mentor-content">
                <h3>{mentor.name}</h3>
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

                <button className="mentor-btn">Book Mentorship Session</button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}