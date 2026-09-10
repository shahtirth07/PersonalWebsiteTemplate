import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Tracks how far the reader has scrolled through a chapter.
 *
 * Progress is written to a ref so the WebGL render loop can sample it every
 * frame without re-rendering React. `activeBeat` is the only piece of state,
 * and it changes at most `beatCount` times per chapter.
 */
export function useChapterProgress(sectionRef, beatCount) {
  const progressRef = useRef(0);
  const [activeBeat, setActiveBeat] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        progressRef.current = self.progress;
        const beat = Math.min(beatCount - 1, Math.floor(self.progress * beatCount));
        setActiveBeat((prev) => (prev === beat ? prev : beat));
      },
    });

    return () => trigger.kill();
  }, [sectionRef, beatCount]);

  return { progressRef, activeBeat };
}

/**
 * True once the chapter is within `margin` pixels of the viewport, so WebGL
 * canvases stay unmounted until they are about to be seen.
 *
 * This measures the element directly on scroll rather than going through an
 * IntersectionObserver or ScrollTrigger. Both of those defer their callbacks to
 * the browser's animation frames, which stop entirely in a background or
 * occluded tab — and a scene that never mounts is far worse than a cheap
 * getBoundingClientRect per chapter per scroll event.
 */
export function useNearViewport(ref, margin = 800) {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const check = () => {
      const rect = el.getBoundingClientRect();
      const isNear =
        rect.top < window.innerHeight + margin && rect.bottom > -margin;
      setNear((prev) => (prev === isNear ? prev : isNear));
    };

    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);

    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [ref, margin]);

  return near;
}
