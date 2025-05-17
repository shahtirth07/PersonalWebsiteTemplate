import React from 'react';
import './Footer.css';
import linkedinIcon from '../assets/linkedin.png';
import githubIcon from '../assets/github.png';
import instagramIcon from '../assets/instagram-logo.png';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="social-links">
          <a 
            href="https://www.linkedin.com/in/tirth-shah-16195b17a/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-link"
          >
            <img src={linkedinIcon} alt="LinkedIn" />
          </a>
          <a 
            href="https://github.com/shahtirth07" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-link"
          >
            <img src={githubIcon} alt="GitHub" />
          </a>
          <a 
            href="https://www.instagram.com/pixellence_7/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-link"
          >
            <img src={instagramIcon} alt="Instagram" />
          </a>
        </div>
        <a 
          href="/Tirth_Resume.pdf" 
          download 
          className="cv-download"
        >
          Download CV
        </a>
        <p className="copyright">© 2025 Tirth Shah. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 