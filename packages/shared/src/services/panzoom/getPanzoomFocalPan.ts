import type { PanzoomMeasure } from "#src/models/panzoom/PanzoomMeasure";
import type { PanzoomPoint } from "#src/models/panzoom/PanzoomPoint";
import type { PanzoomState } from "#src/models/panzoom/PanzoomState";

// The pan that keeps the point under the pointer still while the scale moves to toScale. The pointer's offset from the
// Layout centre is held at the layout point it sits on, which the current scale and pan give, so this is the pan that
// Puts that point back under the pointer at toScale
export const getPanzoomFocalPan = (
  current: PanzoomState,
  toScale: number,
  point: PanzoomPoint,
  measure: PanzoomMeasure,
): PanzoomPoint => {
  const offsetX = point.x - measure.center.x;
  const offsetY = point.y - measure.center.y;
  return {
    x: offsetX / toScale - offsetX / current.scale + current.x,
    y: offsetY / toScale - offsetY / current.scale + current.y,
  };
};
