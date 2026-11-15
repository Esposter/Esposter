export const AntialiasingMode = { Smaa: "Smaa", Traa: "Traa" } as const;
export type AntialiasingMode = (typeof AntialiasingMode)[keyof typeof AntialiasingMode];
