// Inside keeps the element within its parent and caps the scale at the fit, outside keeps it covering its parent and
// Floors the scale at the cover automatic is inside on each axis the element fits and outside on each it overflows,
// With the scale floored at the fit
export const PanzoomContain = { Automatic: "automatic", Inside: "inside", Outside: "outside" } as const;
export type PanzoomContain = (typeof PanzoomContain)[keyof typeof PanzoomContain];
