// The milliseconds in a second, as a number rather than read from Temporal: this entry loads in workers too, where
// Safari has no Temporal and no polyfill runs
export const MILLISECONDS_PER_SECOND = 1000;
