import React from 'react';
import './Hero.css';

const NAME = 'Tirth Shah';
const SUBTITLE = 'Software Development Engineer';
const STAGGER_END_MS = 600;

function getCharDelay(index, total) {
  if (total <= 1) return 0;
  return Math.round((index / (total - 1)) * STAGGER_END_MS);
}

const Hero = () => {
  const nameChars = NAME.split('');
  const typewriterDelayMs = STAGGER_END_MS + 100;

  return (
    <header className="hero">
      <h1 className="hero-heading">
        <span className="hero-heading__prefix">Hi, I&apos;m&nbsp;</span>
        <span className="hero-name" aria-label={NAME}>
          {nameChars.map((char, index) => (
            <span
              key={`${char}-${index}`}
              className="hero-name__char"
              style={{ animationDelay: `${getCharDelay(index, nameChars.length)}ms` }}
              aria-hidden="true"
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </span>
      </h1>
      <p
        className="hero-subtitle"
        style={{
          '--type-ch': SUBTITLE.length,
          '--typewriter-delay': `${typewriterDelayMs}ms`,
          '--typewriter-duration': '2.5s',
        }}
      >
        {SUBTITLE}
      </p>
    </header>
  );
};

export default Hero;
