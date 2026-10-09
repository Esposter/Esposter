// The kinds of forging talent a character's passive gives the blacksmith: an extra result with a chance, ore refunded from
// Each unit, or a unit's seconds reduced
export enum ForgeTalentKind {
  ExtraResult = "ExtraResult",
  ReduceTime = "ReduceTime",
  RefundOre = "RefundOre",
}

// A forging talent: the kind of its effect, the forge type of the recipes it applies to, and the ratio the effect takes
// Its share, the chance of an extra result, the share of ore refunded or the share of a unit's seconds saved
export interface ForgeTalent {
  forgeType: number;
  kind: ForgeTalentKind;
  ratio: number;
}
