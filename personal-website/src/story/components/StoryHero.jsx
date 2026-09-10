import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import HeroScene from '../scenes/HeroScene';
import { heroContent, contactLinks } from '../data/story';
import './StoryHero.css';

const ROLE_INTERVAL = 2600;

const StoryHero = () => {
  const rootRef = useRef(null);
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('.hero__name span', {
          yPercent: 115,
          duration: 1,
          stagger: 0.035,
        })
        .from('.hero__role', { opacity: 0, y: 16, duration: 0.7 }, '-=0.5')
        .from('.hero__summary', { opacity: 0, y: 16, duration: 0.7 }, '-=0.45')
        .from('.hero__actions > *', { opacity: 0, y: 14, duration: 0.6, stagger: 0.08 }, '-=0.45')
        .from('.hero__scroll', { opacity: 0, duration: 0.6 }, '-=0.3');
    }, rootRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setRoleIndex((i) => (i + 1) % heroContent.roles.length);
    }, ROLE_INTERVAL);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header ref={rootRef} className="hero-story" id="top">
      <div className="hero-story__scene" aria-hidden="true">
        <HeroScene />
      </div>

      <div className="hero-story__content">
        <p className="hero__location">{heroContent.location}</p>

        <h1 className="hero__name" aria-label={heroContent.name}>
          {heroContent.name.split('').map((char, i) => (
            <span key={`${char}-${i}`} aria-hidden="true">
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>

        <p className="hero__role" aria-live="polite">
          {heroContent.roles.map((role, i) => (
            <span
              key={role}
              className={`hero__role-item ${i === roleIndex ? 'is-active' : ''}`}
            >
              {role}
            </span>
          ))}
        </p>

        <p className="hero__summary">{heroContent.summary}</p>

        <div className="hero__actions">
          <a className="hero__cta hero__cta--primary" href="#foundations">
            Read the story
          </a>
          <a
            className="hero__cta"
            href={contactLinks.resume}
            target="_blank"
            rel="noopener noreferrer"
          >
            Resume
          </a>
          <a
            className="hero__cta"
            href={contactLinks.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            className="hero__cta"
            href={contactLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </div>
      </div>

      <div className="hero__scroll" aria-hidden="true">
        <span>{heroContent.scrollHint}</span>
        <i />
      </div>
    </header>
  );
};

export default StoryHero;
