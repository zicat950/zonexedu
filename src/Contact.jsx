import React, { useState } from 'react';
import './Contact.css';
import instagramLogo from './assets/instagram.png';
import whatsappLogo from './assets/facebook 2.png';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWhatsAppSubmit = (e) => {
    e.preventDefault();
    
    const text = 
      `*New Course & Mentorship Inquiry*%0A` +
      `----------------------------------%0A` +
      `👤 *Name:* ${formData.name}%0A` +
      `📞 *Phone:* ${formData.phone}%0A` +
      `✉️ *Email:* ${formData.email}%0A` +
      `💬 *Message:* ${formData.message}`;

    const whatsappURL = `https://wa.me/7012302024?text=${text}`;
    window.open(whatsappURL, '_blank');
  };

  return (
    <section className="contact-section">
      {/* Background Trading Effects & Cyber Elements */}
      <div className="contact-grid-bg"></div>
      <div className="contact-ambient-glow glow-top"></div>
      <div className="contact-ambient-glow glow-bottom"></div>
      
      {/* Candlestick / Market Graphic Overlay */}
      <div className="market-chart-overlay">
        <svg viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="market-svg">
          <path d="M0 320 L150 280 L300 310 L450 210 L600 250 L750 140 L900 180 L1050 90 L1200 130" stroke="rgba(0, 240, 255, 0.15)" strokeWidth="2" fill="none" />
          <path d="M0 350 L200 300 L400 330 L600 220 L800 260 L1000 150 L1200 180" stroke="rgba(2, 132, 199, 0.1)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
        </svg>
      </div>

      <div className="contact-container">
        
        {/* Header */}
        <div className="contact-header">
          <div className="badge-wrapper">
            <span className="section-tag-futuristic">CONNECT WITH OUR COMMUNITY</span>
          </div>
          
          <h2 className="main-contact-heading">
            Get In Touch <span className="text-cyan-gradient">With Us</span>
          </h2>
          
          <p className="contact-header-subtitle">
            Have questions about our courses or mentorship programs? Reach out directly via form or connect instantly on WhatsApp & social channels.
          </p>

          <div className="cyber-divider">
            <div className="cyber-cap left"></div>
            <div className="cyber-line"></div>
            <div className="cyber-cap right"></div>
          </div>
        </div>

        {/* Main Glassmorphic Container Wrapper */}
        <div className="contact-wrapper">
          
          {/* Left Side: Contact Information */}
          <div className="contact-info-card">
            <div>
              <h3 className="info-card-title">Contact Information</h3>
              <p className="card-subtitle">Fill up the form or reach us through our official channels below.</p>
              
              <div className="info-items">
                
                {/* Office Address */}
                <div className="info-row">
                  <div className="info-item">
                    <div className="info-icon-box">
                      <span className="info-icon">📍</span>
                    </div>
                    <div>
                      <span className="info-label">Located in</span>
                      <p className="info-val-text">Palarivattom, Kochi</p>
                    </div>
                  </div>
                </div>

                {/* Email Support */}
                <div className="info-row">
                  <div className="info-item">
                    <div className="info-icon-box">
                      <span className="info-icon">✉️️</span>
                    </div>
                    <div>
                      <span className="info-label">Email Support</span>
                      <p className="info-val-text">zonexeduhub@gmail.com</p>
                    </div>
                  </div>
                </div>

                {/* Phone & WhatsApp */}
                <div className="info-row">
                  <div className="info-item">
                    <div className="info-icon-box">
                      <span className="info-icon">📞</span>
                    </div>
                    <div>
                      <span className="info-label">Phone & WhatsApp</span>
                      <p className="info-val-text">+91 9061878038 <br /> +91 7012302024 </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Social Channels Footer */}
            <div className="contact-social-footer">
              <span className="social-footer-label">Official Channels</span>
              <div className="social-icons-group">
                <a 
                  href="https://www.instagram.com/zonex_eduhub_?igsh=MTllODNmaDRmamtvZQ==" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-asset-btn instagram-asset-btn"
                >
                  <img src={instagramLogo} alt="Instagram" onError={(e)=>{e.target.style.display='none'; if(e.target.nextSibling) e.target.nextSibling.style.display='inline';}} />
                  <span className="fallback-icon" style={{display: 'none'}}>📷</span>
                  <span>Instagram</span>
                </a>
                
                <a 
                  href="https://www.facebook.com/zonexeduhub" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-asset-btn facebook-asset-btn"
                >
                  <img src={whatsappLogo} alt="Facebook" onError={(e)=>{e.target.style.display='none'; if(e.target.nextSibling) e.target.nextSibling.style.display='inline';}} />
                  <span className="fallback-icon" style={{display: 'none'}}>💬</span>
                  <span>Facebook</span>
                </a>
              </div>
            </div>

          </div>

          {/* Right Side: Contact Form */}
          <div className="contact-form-card">
            <form onSubmit={handleWhatsAppSubmit}>
              
              <div className="form-row-grid">
                <div className="form-group">
                  <label>
                    <span className="field-icon">👤</span> Your Full Name
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="Zonexeduhub" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>
                    <span className="field-icon">📞</span> Phone Number
                  </label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    placeholder="+91 7012302024" 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <span className="field-icon">✉️</span> Email Address
                </label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="zonexeduhub@gmail.com" 
                  required 
                />
              </div>

              <div className="form-group">
                <label>
                  <span className="field-icon">💬</span> Message / Course Query
                </label>
                <textarea 
                  name="message" 
                  rows="4" 
                  value={formData.message} 
                  onChange={handleChange} 
                  placeholder="Which course or mentorship program are you interested in?" 
                  required
                ></textarea>
              </div>

              <button type="submit" className="submit-whatsapp-btn">
                <span className="wa-icon">💬</span>
                <span className="btn-text">Submit & Send Inquiry on WhatsApp</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </section>
  );
}