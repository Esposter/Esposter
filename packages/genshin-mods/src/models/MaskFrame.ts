// The frame a scan of a script is inside, beside the braces open in an interpolation: a template literal's text, which
// The scan reads as text rather than code
export const MaskFrame = { Template: "template" } as const;
export type MaskFrame = (typeof MaskFrame)[keyof typeof MaskFrame];
