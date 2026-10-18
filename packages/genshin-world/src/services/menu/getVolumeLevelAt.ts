import { VOLUME_LEVEL_MAXIMUM, VOLUME_LEVEL_MINIMUM } from "#src/services/menu/constants";
import { MathUtils } from "three";

// The level a pointer sets at its share of a volume row's track: the share of the highest level, rounded, and held inside
// The row's range, so a drag past either end stops at that end's limit
export const getVolumeLevelAt = (share: number): number =>
  MathUtils.clamp(Math.round(share * VOLUME_LEVEL_MAXIMUM), VOLUME_LEVEL_MINIMUM, VOLUME_LEVEL_MAXIMUM);
