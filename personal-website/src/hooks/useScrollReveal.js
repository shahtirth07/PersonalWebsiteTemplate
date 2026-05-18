import { useEffect } from 'react';

const DEFAULT_THRESHOLD = 0;
const DEFAULT_ROOT_MARGIN = '0px 0px -40px 0px';

/**
 * Observes an element and adds `is-visible` when it enters the viewport.
 * Pair with the `.reveal` class in CSS.
 *
 * By default sections stay visible once revealed and keep observing
 * (does not unobserve), so scrolling through the full page keeps working.
 *
 * @param {React.RefObject<HTMLElement>} ref
 * @param {{ threshold?: number, rootMargin?: string, once?: boolean, replay?: boolean }} [options]
 */
export function useScrollReveal(ref, options = {}) {
  const {
    threshold = DEFAULT_THRESHOLD,
    rootMargin = DEFAULT_ROOT_MARGIN,
    once = false,
    replay = false,
  } = options;

  useEffect(() => {
    const element = ref?.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (replay) {
            entry.target.classList.remove('is-visible');
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, threshold, rootMargin, once, replay]);
}
