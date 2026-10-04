// The first and last bin of an octave band, between the half octaves either side of its centre, in a spectrum of
// `binCount` bins from frames of `frameLength` samples
export const computeBandBins = (
  centre: number,
  sampleRate: number,
  frameLength: number,
  binCount: number,
): [number, number] => {
  const binWidth = sampleRate / frameLength;
  return [
    Math.ceil(centre / Math.SQRT2 / binWidth),
    Math.min(Math.floor((centre * Math.SQRT2) / binWidth), binCount - 1),
  ];
};
