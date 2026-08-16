import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import logo from './assets/zonex-logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSectionClick = (sectionId) => {
    setIsOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="navbar-wrapper">
      <nav className="navbar animate-navbar">
        <div className="navbar-container">
          
          {/* Logo */}
          <div className="navbar-logo">
            <Link to="/">
              <img src={logo} alt="Zonex EduHub Logo" className="logo-img" />
            </Link>
          </div>

          {/* Nav Links */}
          <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
            <li className="nav-item">
              <Link to="/" className="nav-links" onClick={() => setIsOpen(false)}>Home</Link>
            </li>
            <li className="nav-item">
              <button onClick={() => handleSectionClick('about')} className="nav-links nav-btn-reset">About</button>
            </li>
            <li className="nav-item">
              <button onClick={() => handleSectionClick('why-us')} className="nav-links nav-btn-reset">Why Us</button>
            </li>
            <li className="nav-item">
              <button onClick={() => handleSectionClick('courses')} className="nav-links nav-btn-reset">Courses</button>
            </li>
            <li className="nav-item">
              <button onClick={() => handleSectionClick('mentor')} className="nav-links nav-btn-reset">Mentors</button>
            </li>
            <li className="nav-item">
              <button onClick={() => handleSectionClick('contact')} className="nav-links nav-btn-reset">Contact</button>
            </li>
            
            <li className="nav-item mobile-join-item">
              <button onClick={() => handleSectionClick('contact')} className="btn-join nav-btn-reset">
                Join Now
              </button>
            </li>
          </ul>

          {/* Right Actions */}
          <div className="nav-right-actions">
            <button onClick={() => handleSectionClick('contact')} className="btn-join nav-btn-reset desktop-join-btn">
              Join Now
            </button>
            
            <div className="menu-icon" onClick={toggleMenu}>
              <div className={`hamburger-lines ${isOpen ? 'open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>

        </div>
      </nav>
    </header>
  );
};

export default Navbar;