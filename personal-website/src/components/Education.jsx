import React, { useRef } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './Education.css';
import csuChicoLogo from '../assets/california_state_university_chico_logo.jpeg';
import aissmsLogo from '../assets/aissmsioit_logo.jpeg';

const educationData = [
  {
    institution: 'California State University, Chico',
    degree: 'Master of Science in Computer Science',
    duration: 'Aug 2024 - Jul 2026',
    location: 'Chico, CA',
    logo: csuChicoLogo,
    linkedin: 'https://www.csuchico.edu/index.shtml',
    details: ['GPA: 3.96 / 4.0']
  },
  {
    institution: 'Savitribai Phule Pune University',
    degree: 'Bachelor of Engineering in Electronics and Telecommunication',
    duration: 'Aug 2018 - May 2022',
    location: 'Pune, IN',
    logo: aissmsLogo,
    linkedin: 'https://aissmsioit.org',
    details: ['GPA: 3.74 / 4.0']
  }
];

const Education = () => {
  const revealRef = useRef(null);
  useScrollReveal(revealRef);

  return (
  <section id="education" className="education-section">
    <div ref={revealRef} className="reveal">
    <h2>Education</h2>
    <div className="list-container">
      {educationData.map((edu, idx) => (
        <div className="card" key={idx}>
          <div className="education-header">
            {edu.logo && (
              <div className="education-logo-container">
                {edu.linkedin ? (
                  <a href={edu.linkedin} target="_blank" rel="noopener noreferrer">
                    <img src={edu.logo} alt={`${edu.institution} logo`} className="education-logo" />
                  </a>
                ) : (
                  <img src={edu.logo} alt={`${edu.institution} logo`} className="education-logo" />
                )}
              </div>
            )}
            <div className="education-info">
              <h3>{edu.degree}</h3>
              <div className="education-institution">{edu.institution}</div>
              <div className="education-details">
                <span className="education-duration">{edu.duration}</span>
                <span className="education-location">{edu.location}</span>
              </div>
            </div>
          </div>
          {edu.details.length > 0 && (
            <ul className="education-list">
              {edu.details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
    </div>
  </section>
  );
};

export default Education; 