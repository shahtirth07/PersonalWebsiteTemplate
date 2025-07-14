import React from 'react';
import './Publications.css';

const publications = [
  {
    title: 'Vibershield: An Intrusion Detection System',
    url: 'https://www.ijraset.com/best-journal/vibershield-an-intrusion-detection-system',
    summary: 'Vibershield is a novel intrusion detection system that leverages vibration sensors and machine learning to detect unauthorized access in real time. The system is designed for high sensitivity and low false positives, making it suitable for both residential and industrial security applications.',
    bullets: [
      'Utilizes vibration sensors to monitor and detect unusual activity on doors, windows, or other entry points.',
      'Implements a machine learning algorithm to distinguish between normal and suspicious vibrations, reducing false alarms.',
      'Features real-time alerting and a user-friendly dashboard for monitoring intrusion events.',
      'Tested in various environments, demonstrating high accuracy and reliability in intrusion detection.',
      'Published in the International Journal for Research in Applied Science and Engineering Technology (IJRASET).'
    ]
  }
];

const Publications = () => (
  <section id="publications" className="publications-section">
    <h2 className="publications-title">Publications</h2>
    <div className="publications-list">
      {publications.map((pub, idx) => (
        <div className="publication-card" key={idx}>
          <h3>
            <a href={pub.url} target="_blank" rel="noopener noreferrer">{pub.title}</a>
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
  </section>
);

export default Publications; 