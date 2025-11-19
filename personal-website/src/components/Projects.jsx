import React from 'react';
import './Projects.css';
import project1 from '../assets/project-1.png';
import project3 from '../assets/project3.png';

const projects = [
  {
    title: 'MockMouse',
    image: 'https://img.youtube.com/vi/iXucAiIWcFE/maxresdefault.jpg',
    github: '',
    demo: 'https://www.youtube.com/watch?v=iXucAiIWcFE',
    description: [
      'Built an AI agent that turns natural language into automated browser test flows.',
      'Developed with Next.js, Express, TypeScript, WebSocket, Prisma, Supabase, and Flask; integrated Anthropic API (Sonnet4).',
      'Achieved Top 9 overall and Top 3 in Dev Tools at Cal Hacks 2025 (1400+ participants, 350+ teams).'
    ]
  },
  {
    title: 'PagePal',
    image: 'https://img.youtube.com/vi/vVU7Bl2xuoA/maxresdefault.jpg',
    github: 'https://github.com/shahtirth07/PagePal',
    demo: 'https://youtu.be/vVU7Bl2xuoA',
    description: [
      'Developed an AI chat interface for book exploration using a Retrieval Augmented Generation (RAG) pipeline with ChatGPT API and LangChain.',
      'Engineered with React, TypeScript, Flask, and MongoDB Atlas for seamless querying of uploaded content.',
      'Presented at SF Hacks 2025 – recognized for innovation in AI-driven reading experiences.'
    ]
  },
  {
    title: 'Library Management System',
    image: project1,
    github: 'https://github.com/shahtirth07',
    demo: '#',
    description: [
      'Built a full-stack system using Spring Boot (microservices), Angular, and PostgreSQL with secure role-based access.',
      'Developed 30+ REST APIs for auth, catalog, checkout, and notifications with BCrypt security.',
      'Integrated AI-powered search and recommendation via LangChain & NLP, deployed on GCP.'
    ]
  },
  {
    title: 'Walnut Counting System',
    image: project3,
    github: 'https://github.com/shahtirth07',
    demo: '#',
    description: [
      'Developed a deep learning-based walnut counting system using dual CNN architectures.',
      'Implemented custom PyTorch models with mixed-precision training and Apple MPS optimization.',
      'Built a data pipeline with annotation tools, preprocessing, and evaluation metrics (MAE, RMSE, F1, ROC-AUC).'
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
    title: 'React Todo List',
    image: project1,
    github: 'https://github.com/shahtirth07/FrontEnd',
    demo: 'https://lucifer-todo-react.netlify.app/',
    description: [
      'A simple and intuitive todo list app built with React. Add, delete, and mark tasks as complete with a clean UI.'
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
            <ul className="project-description-list" style={{ marginBottom: '1rem' }}>
              {project.description.map((desc, i) => (
                <li key={i}>{desc}</li>
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