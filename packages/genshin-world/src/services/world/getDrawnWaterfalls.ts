import type { WaterfallSheet } from "genshin-engine";

// The sheets the world draws: one with no drop lies flat on the ground rather than falling, and one with no width has
// No area, so neither is drawn. A placement the data repeats at the same lip, across, drop and width is drawn once
export const getDrawnWaterfalls = (waterfalls: WaterfallSheet[]): WaterfallSheet[] => {
  const drawnWaterfalls: WaterfallSheet[] = [];
  const drawnWaterfallKeys = new Set<string>();
  for (const waterfall of waterfalls) {
    if (waterfall.drop === 0 || waterfall.width === 0) continue;

    const waterfallKey = [
      ...waterfall.lip.toArray(),
      ...waterfall.across.toArray(),
      waterfall.drop,
      waterfall.width,
    ].join();
    if (drawnWaterfallKeys.has(waterfallKey)) continue;

    drawnWaterfallKeys.add(waterfallKey);
    drawnWaterfalls.push(waterfall);
  }
  return drawnWaterfalls;
};
