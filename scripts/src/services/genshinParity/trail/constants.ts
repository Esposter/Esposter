// A trail's pixels are pale and nearly grey: each one's luminance passes this, and its channels stay within this spread
export const TRAIL_LUMINANCE_THRESHOLD = 200;
export const TRAIL_CHANNEL_SPREAD_THRESHOLD = 40;
// A frame draws the trail while its trail pixels are at least this share of the peak frame's
export const TRAIL_PRESENT_SHARE = 0.25;
// The trail has faded once its pixels fall under this share of the peak frame's
export const TRAIL_FADED_SHARE = 0.5;
