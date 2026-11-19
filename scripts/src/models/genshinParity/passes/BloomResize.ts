// How the bloom's frames are drawn before they are resized to the display width: at the display width, as every reading
// Is drawn, or at the reference's own width and resized by the same kernel the reference is (`readBloomFrames`)
export const BloomResize = { Display: "display", Source: "source" } as const;
export type BloomResize = (typeof BloomResize)[keyof typeof BloomResize];
