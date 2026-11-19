import type { RadianceLight } from "#src/models/genshinParity/radiance/RadianceLight";
import type { RadianceTriple } from "#src/models/genshinParity/radiance/RadianceTriple";

// One family's light in the radiance table: the mean scene radiance of ours and the reference, the ratio ours over the
// Reference across all channels, and each channel's own ratio, which a white balance's hue shows where a level does not
export interface RadianceRow {
  channelRatios: RadianceTriple;
  clipped: number;
  family: string;
  light: RadianceLight;
  oursMean: number;
  pixels: number;
  ratio: number;
  referenceMean: number;
}
