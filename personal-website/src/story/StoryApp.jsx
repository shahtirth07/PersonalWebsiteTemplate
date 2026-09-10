import React from 'react';
import SmoothScroll from './core/SmoothScroll';
import StoryChapter from './core/StoryChapter';
import StoryNav from './components/StoryNav';
import StoryHero from './components/StoryHero';
import StoryClosing from './components/StoryClosing';
import Graphics from '../components/Graphics';
import FinResearch from '../components/FinResearch';
import { chapters } from './data/story';
import { sceneFor } from './scenes/registry';
import './StoryApp.css';

const StoryApp = () => (
  <SmoothScroll>
    <StoryNav chapters={chapters} />
    <main className="story">
      <StoryHero />
      {chapters.map((chapter) => (
        <StoryChapter
          key={chapter.id}
          id={chapter.id}
          eyebrow={chapter.eyebrow}
          title={chapter.title}
          meta={chapter.meta}
          beats={chapter.beats}
          accent={chapter.accent}
          align={chapter.align}
          scene={sceneFor(chapter.id)}
        />
      ))}

      <div className="story-extras">
        <div className="story-extras__intro">
          <p className="story-extras__eyebrow">Appendix</p>
          <h2 className="story-extras__title">Things I build to think</h2>
          <p className="story-extras__lede">
            Interactive dashboards and WebGL coursework — the sandbox where the
            rendering and data-visualization work gets practiced.
          </p>
        </div>
        <FinResearch />
        <Graphics />
      </div>

      <StoryClosing />
    </main>
  </SmoothScroll>
);

export default StoryApp;
