// A render with its expression applied: each sample scaled by the gain in decibels its time takes between the centres of
// The windows of `windowSeconds` either side, as a fader moves, and by the first or last window's before or past them
export const applyMusicExpression = (
  samples: Float32Array,
  sampleRate: number,
  windowGains: number[],
  windowSeconds: number,
): Float32Array =>
  samples.map((sample, index) => {
    const position = Math.max(index / sampleRate / windowSeconds - 0.5, 0);
    const window = Math.min(Math.floor(position), windowGains.length - 1);
    const share = Math.min(position - window, 1);
    const from = windowGains[window] ?? 0;
    const gain = from + share * ((windowGains[window + 1] ?? from) - from);
    return sample * 10 ** (gain / 20);
  });
