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
    description: [
      'A simple and intuitive todo list app built with React. Add, delete, and mark tasks as complete with a clean UI.'
    ]
  },
  {
    title: 'PagePal (AI Book Chatbot)',
    image: 'https://img.youtube.com/vi/vVU7Bl2xuoA/maxresdefault.jpg',
    github: 'https://github.com/shahtirth07/PagePal',
    demo: 'https://youtu.be/vVU7Bl2xuoA',
    description: [
      'Created an AI-powered chat interface to interact with book content using a RAG pipeline powered by ChatGPT API.',
      'Built with React + TypeScript frontend and Flask + MongoDB Atlas backend, enabling smart querying of uploaded books.',
      'Stack: React, TypeScript, Flask, MongoDB Atlas, ChatGPT API. (SF Hacks 2025)'
    ]
  },
  {
    title: 'BalanciFi',
    image: project3,
    github: 'https://github.com/shahtirth07/BalanciFi',
    demo: '#',
    description: [
      'Developed a personal finance app to track expenses, budgets, and savings with real-time cross-platform sync.',
      'Used Flutter and Firebase Firestore for responsive UI and backendless cloud storage with authentication.',
      'Stack: Flutter, Dart, Firebase Firestore.'
    ]
  },
  {
    title: 'MockMouse',
    image: 'https://img.youtube.com/vi/iXucAiIWcFE/maxresdefault.jpg',
    github: '', // Add your GitHub link if available
    demo: 'https://www.youtube.com/watch?v=iXucAiIWcFE',
    description: [
      'Built an AI-driven browser testing agent that converts natural language to intelligent flows, no scripts or selectors.',
      'Integrated Claude Sonnet 4 via Anthropic API; achieved Top 9 overall and Top 3 in Dev Tools at Cal Hacks 2025 at UC Berkeley (1400+ participants 350+ teams).',
      'Stack: Next.js, Express.js, TypeScript, WebSocket, Prisma, Supabase, Flask, Claude Sonnet 4.'
    ]
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
          {project.description && (
            <ul style={{ textAlign: 'left', marginBottom: '1rem' }}>
              {project.description.map((desc, i) => (
                <li key={i} style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>{desc}</li>
              ))}
            </ul>
          )}
          <div className="project-links">
            {project.github && <a href={project.github} target="_blank" rel="noopener noreferrer">Github</a>}
            <a href={project.demo} target="_blank" rel="noopener noreferrer">Live Demo</a>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default Projects; 