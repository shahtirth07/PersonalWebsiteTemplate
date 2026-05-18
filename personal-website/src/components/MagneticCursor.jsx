import { useEffect } from 'react';
import './MagneticCursor.css';

const INTERACTIVE_SELECTOR = [
  'a',
  'button',
  '.project-card',
  '.experience-card',
  '.award-card',
  '.leadership-card',
  '.publication-card',
  '.card',
  '.graphics-card',
  '.about-link',
  '.nav-link',
  '.skill-tag',
].join(', ');

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
    let rafId = 0;

    const updateCursor = () => {
      cursorX += (mouseX - cursorX) * 0.1;
      cursorY += (mouseY - cursorY) * 0.1;
      dotX += (mouseX - dotX) * 0.3;
      dotY += (mouseY - dotY) * 0.3;

      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
      cursorDot.style.left = `${dotX}px`;
      cursorDot.style.top = `${dotY}px`;

      rafId = requestAnimationFrame(updateCursor);
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const setHover = (active) => {
      cursor.classList.toggle('hover', active);
      cursorDot.classList.toggle('hover', active);
    };

    const handlePointerOver = (e) => {
      const target = e.target.closest(INTERACTIVE_SELECTOR);
      if (target) setHover(true);
    };

    const handlePointerOut = (e) => {
      const from = e.target.closest(INTERACTIVE_SELECTOR);
      const to = e.relatedTarget?.closest(INTERACTIVE_SELECTOR);
      if (from && from !== to) setHover(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerover', handlePointerOver);
    document.addEventListener('pointerout', handlePointerOut);

    rafId = requestAnimationFrame(updateCursor);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerover', handlePointerOver);
      document.removeEventListener('pointerout', handlePointerOut);
      cursor.remove();
      cursorDot.remove();
    };
  }, []);

  return null;
};

export default MagneticCursor;
