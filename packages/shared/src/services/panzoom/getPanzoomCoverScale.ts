import type { PanzoomMeasure } from "#src/models/panzoom/PanzoomMeasure";

// The scale that covers the parent's content box on both axes, the one an element must reach to overflow neither edge
export const getPanzoomCoverScale = (measure: PanzoomMeasure): number =>
  Math.max(measure.parent.width / measure.size.width, measure.parent.height / measure.size.height);
