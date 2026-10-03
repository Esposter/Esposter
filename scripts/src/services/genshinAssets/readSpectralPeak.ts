import type { Spectrogram } from "#src/models/genshinAssets/Spectrogram";

// The peak of a frame's spectrum nearest a frequency: the largest of the bins either side of it, refined by a parabola
// Through the log magnitudes of that bin and its neighbours, which a Hann window's peak follows closely, so a partial
// Between two bins reads at its own frequency and its own height rather than the nearer bin's. A sinusoid of
// Amplitude A under a Hann window of N samples peaks at A N / 4
export const readSpectralPeak = (
  { binCount, frameLength, magnitudes, sampleRate }: Spectrogram,
  frame: number,
  frequency: number,
): { frequency: number; magnitude: number } => {
  const binWidth = sampleRate / frameLength;
  const offset = frame * binCount;
  const readMagnitude = (bin: number): number => (bin > 0 && bin < binCount ? (magnitudes[offset + bin] ?? 0) : 0);
  const nearest = Math.round(frequency / binWidth);
  let peak = nearest;
  for (const bin of [nearest - 1, nearest + 1]) if (readMagnitude(bin) > readMagnitude(peak)) peak = bin;
  const [below, at, above] = [peak - 1, peak, peak + 1].map(readMagnitude);
  // A silent bin has no log to fit a parabola through, so the bin is read as it is
  if (!below || !at || !above) return { frequency: peak * binWidth, magnitude: at ?? 0 };
  const [logBelow, logAt, logAbove] = [Math.log(below), Math.log(at), Math.log(above)];
  const curvature = logBelow - 2 * logAt + logAbove;
  // A peak's vertex lies within half a bin of it; a bin on a slope, the largest of the three but not of its own
  // Neighbours, would put the vertex anywhere, so it is held to the half bin
  const shift = curvature < 0 ? Math.min(Math.max((0.5 * (logBelow - logAbove)) / curvature, -0.5), 0.5) : 0;
  return { frequency: (peak + shift) * binWidth, magnitude: Math.exp(logAt - 0.25 * (logBelow - logAbove) * shift) };
};
