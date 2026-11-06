import { checkIsEnumValue } from "#src/services/shared/checkIsEnumValue";
import { ExpeditionRegion } from "genshin-world";

// Whether a name is the region an expedition belongs to, as the game's own text spells it
export const checkIsExpeditionRegion = (region: string): region is ExpeditionRegion =>
  checkIsEnumValue(ExpeditionRegion, region);
