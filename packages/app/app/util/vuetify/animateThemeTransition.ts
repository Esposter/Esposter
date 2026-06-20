const THEME_TRANSITION_DURATION_MS = 500;

// Circular clip-path reveal expanding from the origin element, used whenever the theme changes.
// Falls back to an instant change when the View Transition API is unavailable or motion is reduced.
export const animateThemeTransition = async (origin: HTMLElement | null, change: () => Promise<void> | void) => {
  const isViewTransitionSupported = typeof window.document.startViewTransition === "function";
  if (!origin || !isViewTransitionSupported || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    await change();
    return;
  }

  const { height, left, top, width } = origin.getBoundingClientRect();
  const x = left + width / 2;
  const y = top + height / 2;
  const right = window.innerWidth - left;
  const bottom = window.innerHeight - top;
  const maxRadius = Math.hypot(Math.max(left, right), Math.max(top, bottom));

  await window.document.startViewTransition(change).ready;
  window.document.documentElement.animate(
    {
      clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`],
    },
    {
      duration: THEME_TRANSITION_DURATION_MS,
      easing: "ease-in-out",
      pseudoElement: "::view-transition-new(root)",
    },
  );
};
