// The blur a bloom level takes: the game's rotated four taps in one pass, or the engine's separable row and column
export const GameBloomBlurForm = { Rotated: "rotated", Separable: "separable" } as const;
export type GameBloomBlurForm = (typeof GameBloomBlurForm)[keyof typeof GameBloomBlurForm];
