import React, { useRef } from 'react';
import './Experience.css';
import { useScrollReveal } from '../hooks/useScrollReveal';
import datameticaLogo from '../assets/datametica_logo.jpeg';
import incubeLogo from '../assets/incubedigital_logo.jpeg';
import technikeinLogo from '../assets/technikien.jpeg';
import csuChicoLogo from '../assets/california_state_university_chico_logo.jpeg';
import sapLogo from '../assets/sap_og.png';

const experienceData = [
  {
    company: 'California State University, Chico',
    position: 'Research Assistant',
    duration: 'Sep 2024 – Present',
    location: 'Chico, CA',
    logo: csuChicoLogo,
    linkedin: 'https://www.csuchico.edu/index.shtml',
    responsibilities: [
      'Built RAG pipelines with grounding and evaluation frameworks for conversational AI, reducing hallucination rate by 40% on noisy real-world inputs.',
      'Co-authored 4 peer-reviewed publications on conversational agents and intelligent systems; research presented at ASEE Zone 4 Conference.'
    ]
  },
  {
    company: 'SAP UCC Chico State',
    position: 'Forward Deployed Software Engineer',
    duration: 'May 2024 – May 2026',
    location: 'Chico, CA',
    logo: sapLogo,
    linkedin: 'https://www.csuchico.edu/index.shtml',
    responsibilities: [
      'Architected and shipped a RAG-based agent for product discovery across 30+ institutional partners, embedding 50K+ catalog items with semantic search; improved query relevance by 35%.',
      'Engineered a real-time notification pipeline using WebSockets, Redis pub/sub, and event-driven architecture; reduced latency from 2+ hours to under 500ms, serving 10K+ concurrent users.',
      'Owned full-stack development of a React + Node.js microservices platform; coordinated with 30+ institutional stakeholders in bi-weekly requirements sessions to shape roadmap and ship production features within sprints.'
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
      'Architected a TDD-driven data migration framework supporting DataStage, Informatica, and Alteryx; achieved 95%+ test coverage and improved downstream compatibility by 60%.',
      'Built a scalable synthetic data generation pipeline in Groovy/Scala, generating 1M+ records per run, cutting QA cycle time by 30 hours/month and enabling parallel test execution.',
      'Designed and maintained multi-team CI/CD infrastructure using GitHub Actions and Jenkins; improved deployment frequency by 25% and reduced production incident recovery time by 40%.',
      'Led monolith-to-microservices migration using Spring Boot, PostgreSQL, and React; reduced API latency by 80% and enabled independent service scaling.'
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

const Experience = () => {
  const revealRef = useRef(null);
  useScrollReveal(revealRef);

  return (
  <section id="experience" className="experience-section">
    <div ref={revealRef} className="reveal">
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
    </div>
  </section>
  );
};

export default Experience; 