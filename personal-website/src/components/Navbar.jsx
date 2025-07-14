import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = ({ theme, toggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isMenuOpen]);

  return (
    <nav className="navbar">
      <div className="nav-content">
        <div className="nav-logo">TS</div>
        
        {/* Hamburger menu button */}
        <button 
          className={`hamburger ${isMenuOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Desktop menu */}
        <div className="nav-links desktop-menu">
          <a href="#about" className="nav-link" onClick={closeMenu}>About</a>
          <a href="#experience" className="nav-link" onClick={closeMenu}>Experience</a>
          <a href="#education" className="nav-link" onClick={closeMenu}>Education</a>
          <a href="#projects" className="nav-link" onClick={closeMenu}>Projects</a>
          <a href="#contact" className="nav-link" onClick={closeMenu}>Contact</a>
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
          <a href="#about" className="nav-link" onClick={closeMenu}>About</a>
          <a href="#experience" className="nav-link" onClick={closeMenu}>Experience</a>
          <a href="#education" className="nav-link" onClick={closeMenu}>Education</a>
          <a href="#projects" className="nav-link" onClick={closeMenu}>Projects</a>
          <a href="#contact" className="nav-link" onClick={closeMenu}>Contact</a>
          <button className="theme-toggle-btn mobile-theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 