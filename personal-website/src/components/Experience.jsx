import React from 'react';
import './Experience.css';
import datameticaLogo from '../assets/datametica_logo.jpeg';
import incubeLogo from '../assets/incubedigital_logo.jpeg';
import technikeinLogo from '../assets/technikien.jpeg';
import chicostateLogo from '../assets/chicostateenterprises_logo.jpeg';

const experienceData = [
  {
    company: 'Chico State Enterprises',
    position: 'AI/ML and Network Engineer',
    duration: 'May 2025 – Present',
    location: 'Chico, CA',
    logo: chicostateLogo,
    linkedin: 'https://www.csuchico.edu/index.shtml',
    responsibilities: [
      'Spearheading modernization of SAP-UCC infrastructure serving 10K+ users across 30+ institutions by integrating intelligent workload routing and network monitoring pipelines, improving system scalability and fault tolerance.',
      'Designed and deployed AI-driven anomaly detection models for service latency prediction using Python, TensorFlow, and Grafana-integrated dashboards, improving uptime and early-alert accuracy by 35%.',
      'Implemented automated QA pipelines with synthetic data generation, ML-based regression validation, and continuous monitoring via Jenkins and Docker, reducing manual verification time by 60%.'
    ]
  },
  {
    company: 'Onix Datametica Birds (Formerly Datametica Pvt Ltd)',
    position: 'Associate Member of Technical Staff',
    duration: 'Oct 2021 – Jul 2024',
    location: 'Pune, IN',
    logo: datameticaLogo,
    linkedin: 'https://www.linkedin.com/company/datametica-birds/posts/?feedView=all',
    responsibilities: [
      'Led development of data migration tools for the Raven suite, adding support for DataStage, Informatica, and Alteryx, improving tool compatibility coverage by 60%.',
      'Built advanced data generator tools in Groovy/Scala, generating 1M+ synthetic records and accelerating test cycles, cutting 30 hours/month in manual QA.',
      'Supported CI/CD pipelines and Agile delivery across 5+ product teams; improved deployment frequency by 25% and reduced rollback incidents.',
      'Developed Raven UI with Spring Boot, PostgreSQL, and React, enabling zero-downtime migrations and automating email alerts with monitoring, cutting stakeholder update latency by 80%.'
    ]
  },
  {
    company: 'SOIL - School of Innovation and Leadership',
    position: 'AI/ML Intern',
    duration: 'July 2021 – Sept 2021',
    location: 'Remote',
    logo: incubeLogo,
    linkedin: 'https://www.linkedin.com/company/6dvarsity/posts/?feedView=all',
    responsibilities: [
      "Developed a book recommendation system for the 'Ask Anjlee' AI solution using BERT, sentence transformers, and NLP techniques with spaCy and NLTK to provide personalized educational support for underprivileged children."
    ]
  },
  {
    company: 'Technikein Technologies',
    position: 'Electronics Intern',
    duration: 'Dec 2020 – Jan 2021',
    location: 'Pune, IN',
    logo: technikeinLogo,
    linkedin: 'https://www.linkedin.com/company/technikien/',
    responsibilities: [
      'Designed and programmed circuits using both C and Assembly languages, focusing on Arduino microcontroller development.'
    ]
  }
];

const Experience = () => (
  <section id="experience" className="experience-section">
    <h2 className="experience-title">Experience</h2>
    <div className="experience-list">
      {experienceData.map((exp, idx) => (
        <div className="experience-card" key={idx}>
          <div className="experience-header">
            {exp.logo && (
              <div className="experience-logo-container">
                {exp.linkedin ? (
                  <a href={exp.linkedin} target="_blank" rel="noopener noreferrer">
                    <img src={exp.logo} alt={`${exp.company} logo`} className="experience-logo" />
                  </a>
                ) : (
                  <img src={exp.logo} alt={`${exp.company} logo`} className="experience-logo" />
                )}
              </div>
            )}
            <div className="experience-info">
              <h3>{exp.position}</h3>
              <div className="experience-company">{exp.company}</div>
              <div className="experience-details">
                <span className="experience-duration">{exp.duration}</span>
                <span className="experience-location">{exp.location}</span>
              </div>
            </div>
          </div>
          <ul className="experience-responsibilities">
            {exp.responsibilities.map((resp, index) => (
              <li key={index}>{resp}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </section>
);

export default Experience; 