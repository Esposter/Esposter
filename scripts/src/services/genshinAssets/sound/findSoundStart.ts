// Where a sound best explains a recording's window, frame by frame from the window's first: at every start inside the
// Window, the cosine of the sound's octave-band levels against the window's over the bands named, as far as the window
// Runs, so a sound the recording cuts short is judged on what it plays
export const findSoundStart = (
  window: readonly number[][],
  sound: readonly number[][],
  bands: readonly number[],
): { score: number; startFrame: number } => {
  let best = { score: 0, startFrame: 0 };
  for (let startFrame = 0; startFrame < window.length; startFrame++) {
    let product = 0;
    let soundPower = 0;
    let windowPower = 0;
    for (const [frame, windowBands] of window.entries()) {
      const soundBands = sound[frame - startFrame];
      for (const band of bands) {
        const windowBandPower = windowBands[band] ?? 0;
        const soundBandPower = soundBands?.[band] ?? 0;
        product += Math.sqrt(windowBandPower * soundBandPower);
        soundPower += soundBandPower;
        windowPower += windowBandPower;
      }
    }
    const norm = Math.sqrt(soundPower * windowPower);
    const score = norm > 0 ? product / norm : 0;
    if (score > best.score) best = { score, startFrame };
  }
  return best;
};
