import type { InjectionKey } from "vue";

// Whether a piece is drawn inside a `GameRect`, which then places it in that rect's box rather than on the canvas
export const GameRectKey: InjectionKey<boolean> = Symbol("GameRect");
