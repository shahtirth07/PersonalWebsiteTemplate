import React, { useRef } from 'react';
import './About.css';
import Hero from './Hero';
import { useScrollReveal } from '../hooks/useScrollReveal';
import aboutPic from '../assets/about-pic.jpg';

const About = () => {
  const revealRef = useRef(null);
  useScrollReveal(revealRef);

  return (
    <section id="about" className="about-section">
      <div ref={revealRef} className="about-container reveal">
        <div className="about-image-container">
          <img 
            src={aboutPic}
            alt="Tirth Shah" 
            className="about-image"
          />
        </div>
        <div className="about-content">
          <Hero />
          <p className="about-description">
            I'm a Software Development Engineer with expertise in building intelligent systems and scalable infrastructure. 
            Currently pursuing my Master's in Computer Science at California State University, Chico, I combine academic knowledge 
            with practical experience to create innovative solutions and modernize enterprise systems.
          </p>
          <div className="about-links">
            <a href="#projects" className="about-link">View My Work</a>
            <a href="#contact" className="about-link">Contact Me</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About; 