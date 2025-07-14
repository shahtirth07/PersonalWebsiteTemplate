import React from 'react';
import ieeeLogo from '../assets/IEEE_logo.svg.png';
import csuChicoLogo from '../assets/california_state_university_chico_logo.jpeg';
import alacrityLogo from '../assets/Alacrity.jpg';
import './Leadership.css';

const leadershipData = [
  {
    organization: 'California State University, Chico',
    logo: csuChicoLogo,
    title: 'Resident Advisor, University Housing',
    type: 'Volunteering',
    duration: 'Aug 2025 - May 2026 · 10 mos',
    location: 'Chico, California, USA',
    description: 'Serving as a Resident Advisor to support and guide students in university housing.'
  },
  {
    organization: 'California State University, Chico',
    logo: csuChicoLogo,
    title: 'Global Ally',
    type: 'Education',
    duration: 'Jan 2025 - Present · 7 mos',
    location: 'Chico, California, USA',
    description: 'Support new and current international students by answering questions, providing guidance, and assisting with any challenges they may face as they transition to life at Chico State.'
  },
  {
    organization: 'IEEE AISSMS IOIT SB',
    logo: ieeeLogo,
    title: 'Co-Chairman IEEE STB AISSMS IOIT',
    type: 'Full-time',
    duration: 'Mar 2021 - Feb 2022 · 1 yr',
    location: 'Pune, Maharashtra, India',
    description: 'Organized 10+ events including an international conference, workshops, seminars, and competitions; led a team of student volunteers; collaborated with faculty and industry professionals; fostered student engagement in technology and engineering activities.'
  },
  {
    organization: 'IEEE',
    logo: ieeeLogo,
    title: 'Volunteer',
    type: 'Volunteering',
    duration: 'Jan 2020 - Dec 2020 · 1 yr',
    location: 'Pune, Maharashtra, India',
    description: 'Supported the organization of technical events and outreach activities; assisted in event logistics and coordination; promoted technical awareness and IEEE initiatives among students.'
  },
  {
    organization: 'AISSMS IOIT - Alacrity',
    logo: alacrityLogo,
    title: 'Head of Sponsorship Team',
    type: 'Leadership',
    duration: '2020 · 1 yr',
    location: 'Pune, Maharashtra, India',
    description: `Led the sponsorship team for Alacrity, the annual tech fest of AISSMS IOIT, securing a successful sponsorship of ₹1 lakh. Alacrity, started in 2010, is a top-rated intercollegiate festival in Pune, hosting 60+ technical, cultural, sports, and social events with national participation. As head, I managed sponsor outreach, negotiations, and team coordination, contributing to the event's legacy of providing a platform for students to explore their talents, enhance management and communication skills, and foster teamwork.`
  }
];

const Leadership = () => (
  <section id="leadership" className="leadership-section">
    <h2 className="leadership-title">Leadership & Volunteering</h2>
    <div className="leadership-list">
      {leadershipData.map((item, idx) => (
        <div className="leadership-card" key={idx}>
          <div className="leadership-header">
            {item.logo && (
              <div className="leadership-logo-container">
                <img src={item.logo} alt={item.organization + ' logo'} className="leadership-logo" />
              </div>
            )}
            <div className="leadership-info">
              <h3>{item.title}</h3>
              <div className="leadership-organization">{item.organization}</div>
              <div className="leadership-details">
                <span className="leadership-type">{item.type}</span>
                <span className="leadership-duration">{item.duration}</span>
                {item.location && <span className="leadership-location">{item.location}</span>}
              </div>
              {item.description && <div className="leadership-description">{item.description}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default Leadership; 