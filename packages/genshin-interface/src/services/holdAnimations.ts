// Holds every running animation of the document at one frame, so a capture is one frame of the screen: a finite one is
// Finished at its end, and one that never ends is paused at its start. The screenshot's own pause for animations does not
// Reliably finish one that starts as the capture begins, such as a progress bar's opening at mount, so a suite holds them
// Itself before it captures
export const holdAnimations = (): void => {
  for (const animation of window.document.getAnimations()) {
    const { iterations } = animation.effect?.getComputedTiming() ?? {};
    if (iterations === Infinity) {
      animation.pause();
      animation.currentTime = 0;
    } else animation.finish();
  }
};
