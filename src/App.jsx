import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Hero from './Hero';
import About from './About';
import WhyUs from './WhyUs';
import Courses from './Courses';
import Mentors from './Mentors';
import Contact from './Contact';
import Profit from './Profit';
import Webinar from './Webinar';
import './App.css';

function Home() {
  return (
    <div className="page-transition" style={{ paddingTop: '85px' }}>
      <section id="hero"><Hero /></section>
      <section id="about"><About /></section>
      <section id="why-us"><WhyUs /></section>
      <section id="courses"><Courses /></section>
      <section id="mentor"><Mentors /></section>
      <section id="webinar"><Webinar /></section>
      <section id="contact"><Contact /></section>
    </div>
  );
}

// Wrapper component to manage conditional navbar visibility based on the current URL
function MainLayout() {
  const location = useLocation();
  const isProfitPage = location.pathname === '/profit';

  return (
    <div className="app">
      {/* Navbar will only show if we are NOT on the profit page */}
      {!isProfitPage && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profit" element={<Profit />} />
        <Route path="/webinar" element={<Webinar />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

export default App;