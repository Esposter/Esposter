import type { ElementalMonument } from "#src/models/puzzle/ElementalMonument";

// A monument lit by a strike, its clock taken as the moment it was lit, so a timed one counts its time from there
export const lightElementalMonument = (monument: ElementalMonument): void => {
  monument.isLit = true;
  monument.litSeconds = monument.elementalState.seconds;
};
