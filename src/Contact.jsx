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
    
    // Replace with your business WhatsApp number (with country code, no '+' or spaces)
    const adminWhatsAppNumber = "919876543210"; 

    const text = 
      `*New Course & Mentorship Inquiry*%0A` +
      `----------------------------------%0A` +
      `👤 *Name:* ${formData.name}%0A` +
      `📞 *Phone:* ${formData.phone}%0A` +
      `✉️ *Email:* ${formData.email}%0A` +
      `💬 *Message:* ${formData.message}`;

    const whatsappURL = `https://wa.me/${adminWhatsAppNumber}?text=${text}`;
    window.open(whatsappURL, '_blank');
  };

  return (
    <section className="contact-section">
      <div className="contact-container">
        
        {/* Header */}
        <div className="contact-header">
          <span className="section-tag">GET IN TOUCH</span>
          <h2>Connect With Our Community</h2>
          <p>Have questions about our courses or mentorship programs? Reach out directly via form or connect instantly on WhatsApp & social channels.</p>
          <div className="header-underline"></div>
        </div>

        <div className="contact-wrapper">
          
          {/* Left Dark Card with Contact Information & Socials */}
          <div className="contact-info-card">
            <div>
              <h3>Contact Information</h3>
              <p className="card-subtitle">Fill up the form or reach us through our official channels below.</p>
              
              <div className="info-items">
                
                {/* Office Address */}
                <div className="info-row">
                  <div className="info-item">
                    <span className="info-icon">📍</span>
                    <div>
                      <span className="info-label">Located in</span>
                      <p>Palarivattom,Kochi</p>
                    </div>
                  </div>
                </div>

                {/* Email Support */}
                <div className="info-row">
                  <div className="info-item">
                    <span className="info-icon">✉️</span>
                    <div>
                      <span className="info-label">Email Support</span>
                      <p>zonexeduhub@gmail.com</p>
                    </div>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="info-row">
                  <div className="info-item">
                    <span className="info-icon">📞</span>
                    <div>
                      <span className="info-label">Phone & WhatsApp</span>
                      <p>+91 (987) 654-3210</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Social Assets Footer */}
            <div className="contact-social-footer">
              <span className="social-footer-label">Official Channels:</span>
              <div className="social-icons-group">
                <a href="https://www.instagram.com/zonex_eduhub_?igsh=MTllODNmaDRmamtvZQ==" target="_blank" rel="noopener noreferrer" className="social-asset-btn">
                  <img src={instagramLogo} alt="Instagram" onError={(e)=>{e.target.style.display='none'; e.target.nextSibling.style.display='inline';}} />
                  <span className="fallback-icon" style={{display: 'none'}}>📷</span>
                  Instagram
                </a>
                <a href="https://www.facebook.com/zonexeduhub" target="_blank" rel="noopener noreferrer" className="social-asset-btn whatsapp-btn">
                  <img src={whatsappLogo} alt="WhatsApp" onError={(e)=>{e.target.style.display='none'; e.target.nextSibling.style.display='inline';}} />
                  <span className="fallback-icon" style={{display: 'none'}}>💬</span>
                  Facebook
                </a>
              </div>
            </div>

          </div>

          {/* Right Form Card */}
          <div className="contact-form-card">
            <form onSubmit={handleWhatsAppSubmit}>
              
              <div className="form-row-grid">
                <div className="form-group">
                  <label>Your Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="John Doe" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    placeholder="+91 98765 43210" 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
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
                <label>Message / Course Query</label>
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
                <span className="wa-icon-text">💬</span> Submit & Send Inquiry on WhatsApp
              </button>
            </form>
          </div>

        </div>

      </div>
    </section>
  );
}