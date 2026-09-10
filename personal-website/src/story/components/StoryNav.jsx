import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './StoryNav.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * Fixed chapter rail plus a page-progress bar. Recruiters rarely read a story
 * top to bottom, so every chapter stays one click away.
 */
const StoryNav = ({ chapters }) => {
  const barRef = useRef(null);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const pageTrigger = ScrollTrigger.create({
      start: 0,
      end: () => document.documentElement.scrollHeight - window.innerHeight,
      onUpdate: (self) => {
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${self.progress})`;
        }
      },
    });

    const chapterTriggers = chapters.map((chapter) =>
      ScrollTrigger.create({
        trigger: `#${chapter.id}`,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => {
          if (self.isActive) setActiveId(chapter.id);
        },
      })
    );

    // The hero owns the rail before the first chapter starts.
    const heroTrigger = ScrollTrigger.create({
      trigger: '#top',
      start: 'top center',
      end: 'bottom center',
      onToggle: (self) => {
        if (self.isActive) setActiveId(null);
      },
    });

    return () => {
      pageTrigger.kill();
      heroTrigger.kill();
      chapterTriggers.forEach((t) => t.kill());
    };
  }, [chapters]);

  return (
    <>
      <div className="story-progress" aria-hidden="true">
        <span ref={barRef} />
      </div>

      <a className="story-nav__mark" href="#top">
        TS
      </a>

      <nav className="story-nav" aria-label="Chapters">
        <ul>
          {chapters.map((chapter, i) => (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                className={activeId === chapter.id ? 'is-active' : ''}
                style={{ '--nav-accent': chapter.accent }}
              >
                <span className="story-nav__index">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="story-nav__label">{chapter.navLabel}</span>
                <span className="story-nav__dot" aria-hidden="true" />
              </a>
            </li>
          ))}
          <li>
            <a href="#closing" className={activeId === 'closing' ? 'is-active' : ''}>
              <span className="story-nav__index">08</span>
              <span className="story-nav__label">Contact</span>
              <span className="story-nav__dot" aria-hidden="true" />
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default StoryNav;
