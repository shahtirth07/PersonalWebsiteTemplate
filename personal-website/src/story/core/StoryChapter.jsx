import React, { useRef } from 'react';
import { useChapterProgress, useNearViewport } from './useChapterProgress';
import { SceneProgressProvider } from './SceneCanvas';
import './StoryChapter.css';

/**
 * The scrollytelling shell every chapter shares: a visual that pins to the
 * viewport while narrative beats scroll past it.
 *
 * `scene` is only mounted once the chapter is near the viewport, which keeps
 * idle WebGL contexts off the page.
 */
const StoryChapter = ({
  id,
  eyebrow,
  title,
  meta,
  beats = [],
  scene: Scene,
  accent = 'var(--color-accent)',
  align = 'left',
}) => {
  const sectionRef = useRef(null);
  const { progressRef, activeBeat } = useChapterProgress(sectionRef, beats.length || 1);
  const nearViewport = useNearViewport(sectionRef);

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`chapter chapter--${align}`}
      style={{ '--chapter-accent': accent }}
    >
      <div className="chapter__sticky">
        <div className="chapter__scene" aria-hidden="true">
          {nearViewport && Scene ? (
            <SceneProgressProvider progressRef={progressRef} activeBeat={activeBeat}>
              <Scene />
            </SceneProgressProvider>
          ) : null}
        </div>
        <div className="chapter__heading">
          {eyebrow ? <p className="chapter__eyebrow">{eyebrow}</p> : null}
          <h2 className="chapter__title">{title}</h2>
          {meta ? <p className="chapter__meta">{meta}</p> : null}
        </div>
      </div>

      <div className="chapter__beats">
        {beats.map((beat, index) => (
          <div
            key={beat.id ?? index}
            className={`chapter__beat ${index === activeBeat ? 'is-active' : ''}`}
          >
            <div className="chapter__beat-inner">
              {beat.label ? <span className="chapter__beat-label">{beat.label}</span> : null}
              {beat.heading ? <h3 className="chapter__beat-heading">{beat.heading}</h3> : null}
              <p className="chapter__beat-body">{beat.body}</p>
              {beat.stats?.length ? (
                <ul className="chapter__stats">
                  {beat.stats.map((stat) => (
                    <li key={stat.label}>
                      <span className="chapter__stat-value">{stat.value}</span>
                      <span className="chapter__stat-label">{stat.label}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {beat.tags?.length ? (
                <ul className="chapter__tags">
                  {beat.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              ) : null}
              {beat.links?.length ? (
                <div className="chapter__links">
                  {beat.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StoryChapter;
