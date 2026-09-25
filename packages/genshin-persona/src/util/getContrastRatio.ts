import { getLinearChannels } from "#src/util/getLinearChannels";

// WCAG 2's relative luminance: each linear channel weighted by how bright the eye sees it
const CHANNEL_WEIGHTS = [0.2126, 0.7152, 0.0722];
// The flare WCAG adds to both sides of a contrast ratio
const FLARE = 0.05;

const getRelativeLuminance = (hexColor: string): number =>
  getLinearChannels(hexColor).reduce((total, channel, index) => total + channel * (CHANNEL_WEIGHTS[index] ?? 0), 0);
// The WCAG 2 contrast ratio of two "#rrggbb" triplets, from 1 for the same colour to 21 for black on white, the same
// Whichever order they come in
export const getContrastRatio = (hexColor: string, otherHexColor: string): number => {
  const [darker, lighter] = [getRelativeLuminance(hexColor), getRelativeLuminance(otherHexColor)].toSorted(
    (a, b) => a - b,
  );
  return ((lighter ?? 0) + FLARE) / ((darker ?? 0) + FLARE);
};
