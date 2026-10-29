// A probe's arrays are capped at this many samples, each the largest of the rows or columns it stands for, so its output
// Stays small whatever the rectangle's size
export const PROBE_MAX_SAMPLES = 64;
// The luminance step an edge must rise by, out of 255, before a probe reports it as an edge rather than as noise
export const PROBE_MIN_EDGE_STEP = 32;
// The level a step is found at along its profile, halfway between the profile's lowest and highest samples
export const PROBE_EDGE_LEVEL = 0.5;
// The Rec. 601 weights a pixel's red, green and blue take in its luminance
export const LUMINANCE_WEIGHTS = [0.299, 0.587, 0.114] as const;
// The channels of an RGB pixel
export const RGB_CHANNEL_COUNT = 3;
