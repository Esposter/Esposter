export const PieType = { Donut: "Donut" } as const;
export type PieType = (typeof PieType)[keyof typeof PieType];
