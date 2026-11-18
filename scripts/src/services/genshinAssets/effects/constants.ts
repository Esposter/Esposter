// Unity's BlendMode values, as a render state's float holds them
export const BLEND_MODE = { One: 1, OneMinusSrcAlpha: 10, SrcAlpha: 5, Zero: 0 } as const;

// Unity's ZWrite values, as a render state's float holds them
export const DEPTH_WRITE = { Off: 0, On: 1 } as const;

// The blends an effect draws with, each as the source and destination factors of its colour: alpha, and additive
export const EFFECT_BLENDS = [
  { destination: BLEND_MODE.OneMinusSrcAlpha, source: BLEND_MODE.SrcAlpha },
  { destination: BLEND_MODE.One, source: BLEND_MODE.One },
] as const;
