import React, { useRef } from 'react';
import './Projects.css';
import { useScrollReveal } from '../hooks/useScrollReveal';
import project1 from '../assets/project-1.png';
import project1a from '../assets/project-1a.png';
import project2 from '../assets/project-2.png';
import project3 from '../assets/project3.png';

const projects = [
  {
    title: 'MockMouse',
    image: 'https://img.youtube.com/vi/iXucAiIWcFE/maxresdefault.jpg',
    github: '',
    demo: 'https://www.youtube.com/watch?v=iXucAiIWcFE',
    description: [
      'Architected a multi-agent orchestration system using Claude LLM for autonomous task planning and execution; converts natural language into sandboxed browser actions with tool execution isolation.',
      'Engineered a distributed agent runtime with a Next.js frontend, FastAPI backend, WebSockets for real-time messaging, and Prisma for state persistence; handles 10K+ concurrent task requests.',
      'Achieved Top 3 in the Dev Tools category at Cal Hacks 2025 (9th overall).'
    ]
  },
  {
    title: 'Déjà Query',
    image: project2,
    github: 'https://github.com/shahtirth07',
    demo: '#',
    description: [
      'Built a dual-mode NL-to-SQL query engine: a cold path that compiles natural language plus schema into SQL and stores it as a reusable template, and a warm path that recognizes repeat queries and slot-fills at zero LLM tokens — achieving 95% token reuse on repeated question patterns.',
      'Implemented semantic similarity matching using EverOS embeddings with a MiniLM fallback, guarded by confidence thresholds and lexical safety rules to prevent template misapplication.',
      'Deployed a cost tracking and analytics dashboard giving live visibility into per-pattern token spend and cumulative savings across the query workload.'
    ]
  },
  {
    title: 'Signal Room',
    image: project1a,
    github: 'https://github.com/shahtirth07',
    demo: '#',
    description: [
      'Designed a multi-agent graph-based memory system (FalkorDB) with live web retrieval for sales lead qualification; a human-in-the-loop approval gate ensures business logic safety.',
      'Orchestrated agent coordination across FastAPI and React services using Apache Iggy event streaming, enabling scalable asynchronous task processing.',
      'Reduced manual lead triage time by 60% while maintaining high-quality response accuracy.'
    ]
  },
  {
    title: 'ChatBook',
    image: 'https://img.youtube.com/vi/vVU7Bl2xuoA/maxresdefault.jpg',
    github: 'https://github.com/shahtirth07/PagePal',
    demo: 'https://youtu.be/vVU7Bl2xuoA',
    description: [
      'Designed a RAG pipeline for semantic document search using LLM embeddings, enabling students to query uploaded course materials conversationally.',
      'Built the full-stack system with a React frontend, Flask backend, and MongoDB Atlas vector store; deployed and iterated based on 200+ user sessions.',
      'Presented at SF Hacks 2025 – recognized for innovation in AI-driven reading experiences.'
    ]
  },
  {
    title: 'BookMatch',
    image: project1,
    github: 'https://github.com/shahtirth07',
    demo: '#',
    description: [
      'Built a hybrid recommender system over a 25K book catalog: collaborative filtering (scikit-learn KNN) for users with history, and BERT embeddings for cold-start.',
      'Deployed embeddings via Elasticsearch with cosine similarity; validated accuracy against 200+ manually-tagged recommendations.'
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
    title: 'Adorable',
    image: project2,
    github: 'https://github.com/shahtirth07',
    demo: '#',
    description: [
      'Open-source AI app builder that lets users create websites and full-stack applications through a conversational chat interface.',
      'Combines AI-assisted code generation, patch-based editing, Git integration, and live preview — built with Next.js, PostgreSQL, Redis, and Anthropic.',
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

const Projects = () => {
  const revealRef = useRef(null);
  useScrollReveal(revealRef);

  return (
  <section id="projects" className="projects-section">
    <div ref={revealRef} className="reveal">
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
    </div>
  </section>
  );
};

export default Projects; 