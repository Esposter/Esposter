export const ScrollFactorSetter = {
  ScrollFactor: "scrollFactor",
  ScrollFactorX: "scrollFactorX",
  ScrollFactorY: "scrollFactorY",
} as const;
export type ScrollFactorSetter = (typeof ScrollFactorSetter)[keyof typeof ScrollFactorSetter];
