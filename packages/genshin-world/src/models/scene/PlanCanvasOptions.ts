import type { SceneAxis } from "#src/models/scene/SceneAxis";

// A rectangle of a part's own geometry a plan is drawn over: its two axes, across the canvas and up it, its corner and
// Size along them, the axis it is looked along, and how many pixels it draws a metre at
export interface PlanCanvasOptions {
  axes: readonly [SceneAxis, SceneAxis];
  corner: readonly number[];
  normalAxis: SceneAxis;
  pixelsPerMetre: number;
  size: readonly number[];
}
