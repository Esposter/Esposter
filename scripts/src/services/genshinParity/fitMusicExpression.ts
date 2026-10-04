import type { BandLevels } from "#src/models/genshinParity/BandLevels";
import type { MusicExpression } from "#src/models/genshinParity/MusicExpression";

import { readMean } from "#src/services/genshinAssets/readMean";
import { fitBroadbandGain } from "#src/services/genshinParity/fitBroadbandGain";
import { readBandGaps } from "#src/services/genshinParity/readBandGaps";
import { splitBandLevelsByWindow } from "#src/services/genshinParity/splitBandLevelsByWindow";

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
  const readBandDistance = (band: number, windowGains: number[]): number =>
    readMean(
      [...windowBandLevelsMap.entries()].flatMap(([window, windowBandLevelsList]) => {
        const bandLevels = windowBandLevelsList[band];
        return bandLevels ? readBandGaps(bandLevels, windowGains[window] ?? 0).map((gap) => Math.abs(gap)) : [];
      }),
    );
  const bands = [...bandLevelsList.keys()];
  const windowGains = fitWindowGains(bands);
  const parityGainsList = [0, 1].map((parity) => fitWindowGains(bands.filter((band) => band % 2 === parity)));
  return {
    distance: readMean(bands.map((band) => readBandDistance(band, windowGains))),
    heldOutDistance: readMean(bands.map((band) => readBandDistance(band, parityGainsList[1 - (band % 2)] ?? []))),
    windowGains,
  };
};
