import React from 'react';
import './Awards.css';
import ieeeLogo from '../assets/IEEE_logo.svg.png';
import datameticaLogo from '../assets/datametica_logo.jpeg';

const awards = [
  {
    title: 'Rising Star Award',
    organization: 'Datametica Birds',
    date: 'June 2023',
    logo: datameticaLogo,
    description: 'Recognized for outstanding performance and contributions to the team.'
  },
  {
    title: 'IEEE Trident 4.0 Winner',
    organization: 'IEEE',
    date: 'September 2019',
    location: 'Pune',
    logo: ieeeLogo,
    description: 'Winner of IEEE Trident 4.0 competition, demonstrating excellence in technical innovation and problem-solving.'
  }
];

const Awards = () => (
  <section id="awards" className="awards-section">
    <h2 className="awards-title">Awards</h2>
    <div className="awards-list">
      {awards.map((award, idx) => (
        <div className="award-card" key={idx}>
          <div className="award-header">
            {award.logo && (
              <div className="award-logo-container">
                <img src={award.logo} alt={`${award.organization} logo`} className="award-logo" />
              </div>
            )}
            <div className="award-info">
              <h3>{award.title}</h3>
              <div className="award-organization">{award.organization}</div>
              <div className="award-details">
                <span className="award-date">{award.date}</span>
                {award.location && <span className="award-location">{award.location}</span>}
              </div>
            </div>
          </div>
          {award.description && <div className="award-description">{award.description}</div>}
        </div>
      ))}
    </div>
  </section>
);

export default Awards;

