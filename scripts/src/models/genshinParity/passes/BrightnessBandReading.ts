import type { BrightnessBand } from "#src/models/genshinParity/passes/BrightnessBand";

// One band's error over the scored pixels it holds: ours less the reference, in CIELab lightness units (0 to 100), the
// Mean signed (positive where ours is brighter) and the mean of its magnitude. Both are undefined where the band holds no pixel
export interface BrightnessBandReading {
  band: BrightnessBand;
  meanAbsoluteError?: number | undefined;
  meanSignedError?: number | undefined;
  pixels: number;
}
