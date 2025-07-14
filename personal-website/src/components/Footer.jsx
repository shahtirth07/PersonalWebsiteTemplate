import React from 'react';
import './Footer.css';
import linkedinIcon from '../assets/linkedin.png';
import githubIcon from '../assets/github.png';
import instagramIcon from '../assets/instagram-logo.png';

// Add Devpost SVG icon
const DevpostIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="11" stroke="#bdbdbd" strokeWidth="2" fill="none"/>
    <text x="12" y="17" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#fff" fontFamily="Arial">D</text>
  </svg>
);

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
          <a
            href="https://devpost.com/shahtirth07?ref_content=user-portfolio&ref_feature=portfolio&ref_medium=global-nav"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            aria-label="Devpost"
          >
            <DevpostIcon />
          </a>
        </div>
        {/* <a 
          href="TirthResume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="cv-download"
        >
          View Resume
        </a> */}
        <p className="copyright">© 2025 Tirth Shah. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 