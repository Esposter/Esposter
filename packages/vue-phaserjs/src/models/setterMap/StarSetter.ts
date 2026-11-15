export const StarSetter = { InnerRadius: "innerRadius", OuterRadius: "outerRadius", Points: "points" } as const;
export type StarSetter = (typeof StarSetter)[keyof typeof StarSetter];
