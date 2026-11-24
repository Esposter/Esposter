// Holds every running animation of the document at one frame, so a capture is one frame of the screen.
// A finite animation is finished at its end, and one that never ends is paused at its start.
// The screenshot's own pause does not reliably finish an animation that starts as the capture begins.
// A progress bar's opening at mount is one such, so a suite holds them itself before it captures.
export const holdAnimations = (): void => {
  for (const animation of window.document.getAnimations()) {
    const { iterations } = animation.effect?.getComputedTiming() ?? {};
    if (iterations === Infinity) {
      animation.pause();
      animation.currentTime = 0;
    } else animation.finish();
  }
};
