// The directions the stone light's sky is gathered from, spread evenly over the whole sphere by a golden-angle spiral,
// Enough that their lights' sums reach the smooth skies the harmonics' two bands hold
const SKY_LOBE_COUNT = 32;
export const SKY_LOBE_DIRECTIONS: [number, number, number][] = Array.from(
  { length: SKY_LOBE_COUNT },
  (_value, index) => {
    const y = 1 - (2 * (index + 0.5)) / SKY_LOBE_COUNT;
    const radius = Math.sqrt(1 - y * y);
    const azimuth = index * Math.PI * (3 - Math.sqrt(5));
    return [radius * Math.cos(azimuth), y, radius * Math.sin(azimuth)];
  },
);
