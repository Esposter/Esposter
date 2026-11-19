import type { RadianceLight } from "#src/models/genshinParity/radiance/RadianceLight";
import type { RadianceTriple } from "#src/models/genshinParity/radiance/RadianceTriple";

// The radiance summed over one family's pixels in one light, beside their count. A pixel where a channel saturates on
// Either frame is counted in `clipped` and summed nowhere, since the curve's white hides how bright it is
export interface RadianceTally {
  clipped: number;
  family: string;
  light: RadianceLight;
  ours: RadianceTriple;
  pixels: number;
  reference: RadianceTriple;
}
