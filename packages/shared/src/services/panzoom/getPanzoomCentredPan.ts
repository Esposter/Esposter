import type { PanzoomMeasure } from "#src/models/panzoom/PanzoomMeasure";
import type { PanzoomPoint } from "#src/models/panzoom/PanzoomPoint";

// The pan that puts the layout centre on the centre of the parent's content box at the scale. The element's centre sits at
// The layout centre plus the scaled pan, so the pan is the gap between the two centres over the scale
export const getPanzoomCentredPan = (scale: number, measure: PanzoomMeasure): PanzoomPoint => {
  const parentCentreX = measure.parent.left + measure.parent.width / 2;
  const parentCentreY = measure.parent.top + measure.parent.height / 2;
  return { x: (parentCentreX - measure.center.x) / scale, y: (parentCentreY - measure.center.y) / scale };
};
