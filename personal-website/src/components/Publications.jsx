import React, { useRef } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './Publications.css';

const publications = [
  {
    title: 'AI Avatars as Dialogic Interfaces for Political Theory Instruction',
    url: 'https://peer.asee.org/58397',
    summary:
      'Shah, T. B. et al. (2025). AI Avatars as Dialogic Interfaces for Political Theory Instruction. ASEE Zone IV Conference.',
    bullets: [
      'Explored AI avatars as dialogic interfaces for teaching political theory.',
      'Presented at the ASEE Zone IV Conference.',
    ],
  },
  {
    title:
      'Extending Intelligent Discussion Boards with Video-Based Learning: Integrating Kaltura Video Analysis in ChatBook for Enhanced CS Education',
    url: 'https://peer.asee.org/58414',
    summary:
      'Shah, T. B. et al. (2025). Extending Intelligent Discussion Boards with Video-Based Learning: Integrating Kaltura Video Analysis in ChatBook for Enhanced CS Education. ASEE Zone IV Conference.',
    bullets: [
      'Extended ChatBook with Kaltura video analysis for video-based learning support.',
      'Presented at the ASEE Zone IV Conference.',
    ],
  },
  {
    title:
      'From confusion to clarity in introductory computer science through intelligent discussion board systems',
    url: 'https://dl.acm.org/doi/abs/10.5555/3778141.3778160',
    summary:
      'Shah, T. B., Tilekar, S., Sharma, K., Attarwala, A., & Lindoo, E. (2025). From confusion to clarity in introductory computer science through intelligent discussion board systems. Proceedings of the Consortium for Computing Sciences in Colleges Rocky Mountain Conference (ACM), Orem, UT.',
    bullets: [
      'Research on improving student engagement and learning outcomes in introductory computer science courses.',
      'Developed intelligent discussion board systems to enhance student comprehension and reduce confusion.',
      'Presented at the Consortium for Computing Sciences in Colleges Rocky Mountain Conference (ACM).',
    ],
  },
  {
    title: 'VIBERSHIELD: An Intrusion Detection System',
    url: 'https://doi.org/10.22214/ijraset.2023.48727',
    summary:
      'VIBERSHIELD is a novel intrusion detection system that leverages vibration sensors and machine learning to detect unauthorized access in real time.',
    bullets: [
      'Utilizes vibration sensors to monitor and detect unusual activity on doors, windows, or other entry points.',
      'Implements a machine learning algorithm to distinguish between normal and suspicious vibrations, reducing false alarms.',
      'Published in IJRASET — January 2023.',
    ],
  },
];

const Publications = () => {
  const revealRef = useRef(null);
  useScrollReveal(revealRef);

  return (
    <section id="publications" className="publications-section">
      <div ref={revealRef} className="reveal">
        <h2 className="publications-title">Publications</h2>
        <div className="publications-list">
          {publications.map((pub, idx) => (
            <div className="publication-card" key={idx}>
              <h3>
                <a href={pub.url} target="_blank" rel="noopener noreferrer">
                  {pub.title}
                </a>
              </h3>
              <p>{pub.summary}</p>
              <ul className="publication-bullets">
                {pub.bullets.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Publications;
