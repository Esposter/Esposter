import type { PanzoomMeasure } from "#src/models/panzoom/PanzoomMeasure";
import type { PanzoomStartScale } from "#src/models/panzoom/PanzoomStartScale";

import { getPanzoomFitScale } from "#src/services/panzoom/getPanzoomFitScale";

// The scale a start or a reset applies: the number it names, or the fit when it asks for one
export const getPanzoomStartScale = (startScale: PanzoomStartScale, measure: PanzoomMeasure): number =>
  startScale === "fit" ? getPanzoomFitScale(measure) : startScale;
