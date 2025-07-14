import React from 'react';
import './Education.css';
import csuChicoLogo from '../assets/california_state_university_chico_logo.jpeg';
import aissmsLogo from '../assets/aissmsioit_logo.jpeg';

const educationData = [
  {
    institution: 'California State University, Chico',
    degree: 'Master of Science in Computer Science',
    duration: 'May 2026',
    location: 'Chico, CA',
    logo: csuChicoLogo,
    details: [
      'CGPA: 3.7/4'
    ]
  },
  {
    institution: 'AISSMS Institute of Information Technology',
    degree: 'Bachelor of Engineering in Electronics and Telecommunication',
    duration: 'May 2022',
    location: 'Pune, IN',
    logo: aissmsLogo,
    details: []
  }
];

const Education = () => (
  <section id="education" className="education-section">
    <h2>Education</h2>
    <div className="list-container">
      {educationData.map((edu, idx) => (
        <div className="card" key={idx}>
          <div className="education-header">
            {edu.logo && (
              <div className="education-logo-container">
                <img src={edu.logo} alt={`${edu.institution} logo`} className="education-logo" />
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
  </section>
);

export default Education; 