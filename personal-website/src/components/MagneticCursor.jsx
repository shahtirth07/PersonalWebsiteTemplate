import { useEffect } from 'react';
import './MagneticCursor.css';

const MagneticCursor = () => {
  useEffect(() => {
    const cursor = document.createElement('div');
    const cursorDot = document.createElement('div');
    cursor.className = 'magnetic-cursor';
    cursorDot.className = 'magnetic-cursor-dot';
    document.body.appendChild(cursor);
    document.body.appendChild(cursorDot);

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let dotX = 0;
    let dotY = 0;

    const updateCursor = () => {
      cursorX += (mouseX - cursorX) * 0.1;
      cursorY += (mouseY - cursorY) * 0.1;
      dotX += (mouseX - dotX) * 0.3;
      dotY += (mouseY - dotY) * 0.3;

      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
      cursorDot.style.transform = `translate(${dotX}px, ${dotY}px)`;

      requestAnimationFrame(updateCursor);
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseEnter = (e) => {
      cursor.classList.add('hover');
    };

    const handleMouseLeave = (e) => {
      cursor.classList.remove('hover');
    };

    document.addEventListener('mousemove', handleMouseMove);
    
    let interactiveElements = [];
    
    // Wait for DOM to be ready
    const setupInteractiveElements = () => {
      interactiveElements = Array.from(document.querySelectorAll('a, button, .project-card, .experience-card, .award-card, .leadership-card, .publication-card, .about-link, .nav-link'));
      interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
      });
    };
    
    setTimeout(setupInteractiveElements, 100);

    updateCursor();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
      if (document.body.contains(cursor)) {
        document.body.removeChild(cursor);
      }
      if (document.body.contains(cursorDot)) {
        document.body.removeChild(cursorDot);
      }
    };
  }, []);

  return null;
};

export default MagneticCursor;

