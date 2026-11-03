import React from 'react';
import { Link } from 'react-router-dom';
import './Profit.css';

export default function Profit() {
  const content = [
    { type: 'video', fileName: 'video6.mp4', title: '28 WEEK P&L' },
    { type: 'video', fileName: 'video4.mp4', title: '6 MONTH P&L' },
    { type: 'video', fileName: 'video3.mp4', title: 'Valetax 1 WEEK P&L' },
    { type: 'video', fileName: 'video4.mp4', title: 'NFP DAY' },
    { type: 'video', fileName: 'video1.mp4', title: '3 MONTH P&L' },
    { type: 'video', fileName: 'video2.mp4', title: 'SMALL ACCOUNT FLIP' },
    { type: 'image', fileName: 'photo99.png', title: '1 YEAR P&L' },
    { type: 'image', fileName: 'photo98.png', title: '1 WEEK PROFIT' },
  ];

  return (
    <div className="profit-page">
      <div className="profit-header-container">
        <div className="profit-badge">VERIFIED PERFORMANCE</div>
        <br /> <br />
        <h1 className="profit-title">
          Live Profit &amp; Loss Report
        </h1>
        <br />
        <p className="profit-subtitle">
          Real-time account statements, trade executions, and verified growth metrics.
        </p>
      </div>

      <div className="profit-grid">
        {content.map((item, index) => (
          <div 
            key={index} 
            className="profit-card"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {item.type === 'video' ? (
              <div className="media-container">
                <video 
                  className="profit-media" 
                  controls 
                  controlsList="nodownload"
                  preload="metadata"
                >
                  <source src={`/Videos/${item.fileName}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="media-container">
                <img 
                  src={`/image/${item.fileName}`} 
                  alt={item.title} 
                  className="profit-media" 
                />
              </div>
            )}
            <h3 className="profit-card-title">
              {item.title}
            </h3>
          </div>
        ))}
      </div>

      <div className="back-btn-container">
        <Link to="/" className="profit-back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" className="back-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}