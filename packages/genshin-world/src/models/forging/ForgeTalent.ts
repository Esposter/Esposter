import type { ForgeTalentKind } from "#src/models/forging/ForgeTalentKind";

// A forging talent: the kind of its effect, the forge type of the recipes it applies to, and the ratio the effect takes
// Its share, the chance of an extra result, the share of ore refunded or the share of a unit's seconds saved
export interface ForgeTalent {
  forgeType: number;
  kind: ForgeTalentKind;
  ratio: number;
}
