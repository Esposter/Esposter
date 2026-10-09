import type { LabelSimilarityResult } from "#src/models/genshinParity/witness/LabelSimilarityResult";

// The page's form of a label similarity result, each term map's floats as base64
export interface EncodedLabelSimilarityResult extends Omit<LabelSimilarityResult, "termMaps"> {
  termMaps: { height: number; terms: string; width: number }[];
}
