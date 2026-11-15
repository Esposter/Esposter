export const NamedFieldCitation = {
  AttackTag: "attackTag",
  Element: "element",
  InternalCooldownTag: "internalCooldownTag",
  ScalingAttribute: "scalingAttribute",
} as const;
export type NamedFieldCitation = (typeof NamedFieldCitation)[keyof typeof NamedFieldCitation];
