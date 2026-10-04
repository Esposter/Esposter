import type { BandLevels } from "#src/models/genshinParity/music/BandLevels";
import type { MusicExpression } from "#src/models/genshinParity/music/MusicExpression";

import { computeMean } from "#src/services/genshinAssets/shared/computeMean";
import { computeBandGaps } from "#src/services/genshinParity/music/computeBandGaps";
import { fitBroadbandGain } from "#src/services/genshinParity/music/fitBroadbandGain";
import { splitBandLevelsByWindow } from "#src/services/genshinParity/music/splitBandLevelsByWindow";

// A render's expression fitted to the game's, window by window: each window's one gain over every band
// (`fitBroadbandGain`), a window no frame lies in taking its nearest's. The same gains are fitted to the even bands and
// Scored on the odd, and the other way, so a swell the game holds in every band reads alike both ways while a gain
// That only bends one band's balance does not. `frameTimes` are the centres of the frames `bandLevelsList` holds in
// Seconds
export const fitMusicExpression = (
  bandLevelsList: BandLevels[],
  frameTimes: number[],
  windowSeconds: number,
): MusicExpression => {
  const windowBandLevelsMap = splitBandLevelsByWindow(bandLevelsList, frameTimes, windowSeconds);
  const windows = [...windowBandLevelsMap.keys()];
  const windowCount = Math.max(-1, ...windows) + 1;
  const fitWindowGains = (bands: number[]): number[] => {
    const windowGainMap = new Map(
      Array.from(windowBandLevelsMap.entries(), ([window, windowBandLevelsList]) => [
        window,
        fitBroadbandGain(bands.flatMap((band) => windowBandLevelsList[band] ?? [])).gain,
      ]),
    );
    return Array.from({ length: windowCount }, (_, window) => {
      const nearest = windows.reduce((best, other) =>
        Math.abs(other - window) < Math.abs(best - window) ? other : best,
      );
      return windowGainMap.get(window) ?? windowGainMap.get(nearest) ?? 0;
    });
  };
  // Each band's mean distance with every window at its gain
  const computeBandDistance = (band: number, windowGains: number[]): number =>
    computeMean(
      [...windowBandLevelsMap.entries()].flatMap(([window, windowBandLevelsList]) => {
        const bandLevels = windowBandLevelsList[band];
        return bandLevels ? computeBandGaps(bandLevels, windowGains[window] ?? 0).map((gap) => Math.abs(gap)) : [];
      }),
    );
  const bands = [...bandLevelsList.keys()];
  const windowGains = fitWindowGains(bands);
  const parityGainsList = [0, 1].map((parity) => fitWindowGains(bands.filter((band) => band % 2 === parity)));
  return {
    distance: computeMean(bands.map((band) => computeBandDistance(band, windowGains))),
    heldOutDistance: computeMean(bands.map((band) => computeBandDistance(band, parityGainsList[1 - (band % 2)] ?? []))),
    windowGains,
  };
};
