import type { CanvasRect } from "#src/models/CanvasRect";

// A RectTransform as a screen's fit writes it, each pair a plain array in the JSON, with its scale where it is not one
export interface FittedInterfaceRect extends Record<keyof CanvasRect, number[]> {
  scale?: number[];
}
