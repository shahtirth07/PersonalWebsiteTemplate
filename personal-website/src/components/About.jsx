import React from 'react';
import './About.css';
// import aboutPic from '../assets/about-pic.jpg';

const About = () => {
  return (
    <section id="about" className="about-section">
      <div className="about-container">
        <div className="about-image-container">
          {/* <img 
            src={aboutPic}
            alt="Tirth Shah" 
            className="about-image"
          /> */}
        </div>
        <div className="about-content">
          <h1 className="about-title">Hi, I'm <span className="highlight">Tirth Shah</span></h1>
          <h2 className="about-subtitle">Software Developer</h2>
          <p className="about-description">
            I'm a passionate software developer with expertise in web development and a strong foundation in computer science. 
            Currently pursuing my Master's in Computer Science at California State University, Chico, I combine academic knowledge 
            with practical experience to create innovative solutions.
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