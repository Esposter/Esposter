// The two ornaments the time dial's frame carries, at its top and at its bottom
export const TimeDialOrnamentPosition = { Bottom: "bottom", Top: "top" } as const;
export type TimeDialOrnamentPosition = (typeof TimeDialOrnamentPosition)[keyof typeof TimeDialOrnamentPosition];
