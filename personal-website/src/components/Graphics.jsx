import React, { useState } from 'react';
import './Graphics.css';

const graphicsProjects = [
  {
    title: 'WebGL Shapes and Gradients',
    file: 'Assignment1.html',
    description: 'Basic WebGL shapes with color gradients and rotation controls. Demonstrates fundamental WebGL rendering and matrix transformations.',
    category: 'Basics'
  },
  {
    title: 'Interactive 3D Terrain with Skybox',
    file: 'hills.html',
    description: 'Interactive 3D terrain rendering with skybox, WASD movement controls, mouse look, and dynamic time-of-day lighting.',
    category: '3D Graphics'
  },
  {
    title: 'Advanced Terrain Rendering',
    file: 'hills2.html',
    description: 'Enhanced terrain system with improved rendering techniques and visual effects.',
    category: '3D Graphics'
  },
  {
    title: 'Procedural Sand with Animated Water Ripples',
    file: 'homework2.html',
    description: 'Procedural sand texture generation with animated water ripples using noise functions and shader programming.',
    category: 'Procedural'
  },
  {
    title: '3D Shapes with Phong Lighting Model',
    file: 'homework4.html',
    description: 'Multiple 3D shapes with Phong lighting model, material properties, and interactive controls for light positioning.',
    category: 'Lighting'
  },
  {
    title: '3D Windmill Scene with Camera Controls',
    file: 'homework3.html',
    description: 'Interactive 3D windmill scene with camera movement controls, demonstrating advanced WebGL rendering and scene composition.',
    category: 'Advanced'
  },
  {
    title: 'Advanced WebGL Rendering Techniques',
    file: 'homework5.html',
    description: 'Final project showcasing advanced WebGL rendering techniques, complex shader programming, and interactive 3D graphics.',
    category: 'Advanced'
  }
];

const Graphics = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const getProjectUrl = (filename) => {
    // Files should be in public/graphics/ folder for Vite to serve them
    // They will be accessible at /graphics/filename.html
    return `/graphics/${filename}`;
  };

  const categories = [...new Set(graphicsProjects.map(p => p.category))];

  const filteredProjects = activeFilter === 'all' 
    ? graphicsProjects 
    : graphicsProjects.filter(p => p.category === activeFilter);

  const handleFilterClick = (category) => {
    setActiveFilter(category);
  };

  return (
    <section id="graphics" className="graphics-section">
      <h2 className="graphics-title">Computer Graphics Projects</h2>
      <p className="graphics-intro">
        A collection of WebGL projects from my Computer Graphics course, showcasing 3D rendering, 
        shader programming, lighting models, and interactive graphics techniques.
      </p>
      
      <div className="graphics-filters">
        <button 
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterClick('all')}
        >
          All
        </button>
        {categories.map(category => (
          <button 
            key={category} 
            className={`filter-btn ${activeFilter === category ? 'active' : ''}`}
            onClick={() => handleFilterClick(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="graphics-grid">
        {filteredProjects.map((project, idx) => (
          <div key={idx} className="graphics-card" data-category={project.category}>
            <div className="graphics-card-header">
              <span className="graphics-category-badge">{project.category}</span>
              <h3>{project.title}</h3>
            </div>
            <p className="graphics-description">{project.description}</p>
            <div className="graphics-card-footer">
              <a 
                href={getProjectUrl(project.file)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="graphics-link"
              >
                View Project →
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Graphics;

