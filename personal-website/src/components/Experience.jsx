import React from 'react';
import './Experience.css';
import datameticaLogo from '../assets/datametica_logo.jpeg';
import incubeLogo from '../assets/incubedigital_logo.jpeg';
import technikeinLogo from '../assets/technikien.jpeg';
import chicostateLogo from '../assets/chicostateenterprises_logo.jpeg';

const experienceData = [
  {
    company: 'Chico State University – SAP UCC Project',
    position: 'Team Lead / Full-Stack Engineer Intern',
    duration: 'May 2025 – Present',
    location: 'Chico, CA',
    logo: chicostateLogo,
    responsibilities: [
      'Leading development of SAP-UCC portal used by 10K+ users across 30+ institutions; defined system architecture and introduced mono-repo with Node.js, React-Redux, and Tailwind.',
      'Built 40+ REST APIs (300 endpoints) with <250ms latency; implemented RBAC, JWT auth, and cron jobs to automate cleanup of 100K+ tokens/week.',
      'Integrated CI/CD (GitHub Actions, Jest), EJS-based email workflows, and Winston logging, boosting engagement by 25%, test coverage to 78%, and reducing debugging time by 60%.'
    ]
  },
  {
    company: 'Onix Datametica Birds (Formerly Datametica Pvt Ltd)',
    position: 'Associate Member Of Technical Staff / Associate Engineer / Product Intern',
    duration: 'October 2021 – July 2024',
    location: 'Pune, IN',
    logo: datameticaLogo,
    responsibilities: [
      'Spearheaded development of data migration tools for the Raven product suite, enhancing support for DataStage and building new tools for Informatica and Alteryx.',
      'Designed and implemented advanced data generator tools using Groovy and Scala, producing over 1 million synthetic records and improving query performance, reducing testing time by 30 hours monthly.',
      'Proficient in CI/CD methodologies within Agile environments, adeptly supporting both Kanban and Scrum workflows in a TDD approach.',
      'Built Raven UI with Spring Boot, JPA, PostgreSQL, React, and Docker to streamline migrations and implemented automated email notifications to enhance stakeholder communication.'
    ]
  },
  {
    company: 'SOIL - School of Innovation and Leadership',
    position: 'AI/ML Intern',
    duration: 'July 2021 – Sept 2021',
    location: 'Remote',
    logo: incubeLogo,
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
                <img src={exp.logo} alt={`${exp.company} logo`} className="experience-logo" />
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