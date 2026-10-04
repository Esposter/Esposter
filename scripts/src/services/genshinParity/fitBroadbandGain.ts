import type { BandLevels } from "#src/models/genshinParity/BandLevels";

import { fitBandGain } from "#src/services/genshinParity/fitBandGain";

// The one gain in decibels every band takes together that brings ours nearest the game's, with the mean distance over
// The bands left at it: each band is shifted so its floor lies at 0, which keeps each frame's gap as it was, and the
// Bands' frames are then fitted as one band's (`fitBandGain`)
export const fitBroadbandGain = (bandLevelsList: BandLevels[]): { distance: number; gain: number } =>
  fitBandGain({
    floor: 0,
    game: bandLevelsList.flatMap(({ floor, game }) => game.map((level) => level - floor)),
    ours: bandLevelsList.flatMap(({ floor, ours }) => ours.map((level) => level - floor)),
  });
