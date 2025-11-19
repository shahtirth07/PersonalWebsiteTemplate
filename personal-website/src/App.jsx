import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import About from './components/About'
import Projects from './components/Projects'
import Publications from './components/Publications'
import Awards from './components/Awards'
import Leadership from './components/Leadership'
import Experience from './components/Experience'
import Education from './components/Education'
import Contact from './components/Contact'
import Footer from './components/Footer'
import TechnicalSkills from './components/TechnicalSkills'
import Graphics from './components/Graphics'
import Network3D from './components/Network3D'
import MagneticCursor from './components/MagneticCursor'
import './App.css'

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.body.classList.toggle('dark-theme', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    document.querySelectorAll('section').forEach((section) => {
      observer.observe(section);
    });

    return () => {
      document.querySelectorAll('section').forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <>
      <Network3D />
      <MagneticCursor />
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <About />
      <Projects />
      <Graphics />
      <TechnicalSkills />
      <Experience />
      <Education />
      <Publications />
      <Awards />
      <Leadership />
      <Contact />
      <Footer />
    </>
  )
}

export default App
