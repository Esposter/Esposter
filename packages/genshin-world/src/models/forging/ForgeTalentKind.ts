// The kinds of forging talent a character's passive gives the blacksmith: an extra result with a chance, ore refunded from
// Each unit, or a unit's seconds reduced
export const ForgeTalentKind = {
  ExtraResult: "ExtraResult",
  ReduceTime: "ReduceTime",
  RefundOre: "RefundOre",
} as const;
export type ForgeTalentKind = (typeof ForgeTalentKind)[keyof typeof ForgeTalentKind];
