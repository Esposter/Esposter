import {
  ABYSS_LONG_CLOCK_SECONDS,
  ABYSS_SHORT_CLOCK_LAST_FLOOR_INDEX,
  ABYSS_SHORT_CLOCK_SECONDS,
} from "#src/services/spiralAbyss/constants";

// The seconds a chamber of the floor at `floorIndex` gives its clock: the first four floors give five minutes, the rest ten
export const getAbyssChamberSeconds = (floorIndex: number): number =>
  floorIndex <= ABYSS_SHORT_CLOCK_LAST_FLOOR_INDEX ? ABYSS_SHORT_CLOCK_SECONDS : ABYSS_LONG_CLOCK_SECONDS;
