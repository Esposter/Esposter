export const pauseAnimations = (): void => {
  // Reading the animations resolves the styles that start them, and a held one stays listed once it would have ended
  for (const animation of window.document.getAnimations()) animation.pause();
};
