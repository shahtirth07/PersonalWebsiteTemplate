import React from 'react';
import './Projects.css';
import project1 from '../assets/project-1.png';
import project3 from '../assets/project3.png';

// Example project data (replace with your real data)
const projects = [
  {
    title: 'React Todo List',
    image: project1,
    github: 'https://github.com/shahtirth07/FrontEnd',
    demo: 'https://lucifer-todo-react.netlify.app/',
  },
  {
    title: 'PagePal (AI Book Chatbot)',
    image: 'https://img.youtube.com/vi/vVU7Bl2xuoA/maxresdefault.jpg',
    github: 'https://github.com/shahtirth07/PagePal',
    demo: 'https://youtu.be/vVU7Bl2xuoA',
  },
  {
    title: 'BalanciFi',
    image: project3,
    github: 'https://github.com/shahtirth07/BalanciFi',
    demo: '#', // Add your demo link here
  },
];

const Projects = () => (
  <section id="projects" className="projects-section">
    <h2 className="projects-title">Projects</h2>
    <div className="projects-scroll">
      {projects.map((project, idx) => (
        <div className="project-card" key={idx}>
          <img src={project.image} alt={project.title} className="project-img" />
          <h3>{project.title}</h3>
          <div className="project-links">
            <a href={project.github} target="_blank" rel="noopener noreferrer">Github</a>
            <a href={project.demo} target="_blank" rel="noopener noreferrer">Live Demo</a>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default Projects; 