import { FAMILY_COLORS } from "#src/services/genshinParity/shared/constants";

// The colour a family's parts are drawn in on the witness's previews, the palette repeating past its last
export const getFamilyColor = (familyIndex: number): readonly [number, number, number] =>
  FAMILY_COLORS[familyIndex % FAMILY_COLORS.length] ?? [255, 255, 255];
