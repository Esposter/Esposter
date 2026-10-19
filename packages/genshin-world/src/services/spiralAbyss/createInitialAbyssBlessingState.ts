import type { AbyssBlessingState } from "#src/models/spiralAbyss/AbyssBlessingState";

// The blessing state a chamber starts with, before any reaction in it has been answered
export const createInitialAbyssBlessingState = (): AbyssBlessingState => ({
  blessingReadySecondsMap: new Map(),
  shockwavePositions: [],
});
