import type { PanzoomMeasure } from "#src/models/panzoom/PanzoomMeasure";

// The scale that fits the element inside its parent's content box on both axes
export const getPanzoomFitScale = (measure: PanzoomMeasure): number =>
  Math.min(measure.parent.width / measure.size.width, measure.parent.height / measure.size.height);
