import type { BandLevels } from "#src/models/genshinParity/BandLevels";
import type { WindowGains } from "#src/models/genshinParity/WindowGains";

import { fitBandGain } from "#src/services/genshinParity/fitBandGain";
import { splitBandLevelsByWindow } from "#src/services/genshinParity/splitBandLevelsByWindow";

// Each band's fitted gain (`fitBandGain`) over each window of `windowSeconds` that holds a frame, in order: a gain that
// Holds from window to window is the render's balance and an equaliser's to correct, and one that moves with them is
// The game's arrangement or its dynamics changing under ours. `frameTimes` are the centres of the frames
// `bandLevelsList` holds in seconds
export const readGainsOverTime = (
  bandLevelsList: BandLevels[],
  frameTimes: number[],
  windowSeconds: number,
): WindowGains[] =>
  [...splitBandLevelsByWindow(bandLevelsList, frameTimes, windowSeconds).entries()]
    .toSorted(([first], [second]) => first - second)
    .map(([window, windowBandLevelsList]) => ({
      gains: windowBandLevelsList.map((bandLevels) => fitBandGain(bandLevels).gain),
      start: window * windowSeconds,
    }));
