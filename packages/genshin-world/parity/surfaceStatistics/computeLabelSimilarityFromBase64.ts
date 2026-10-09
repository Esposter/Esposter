import type { LabelSimilarityInput } from "#parity/surfaceStatistics/LabelSimilarityInput";
import type { LabelSimilarityOutput } from "#parity/surfaceStatistics/LabelSimilarityOutput";

import { computeLabelSimilarity } from "#parity/surfaceStatistics/computeLabelSimilarity";
import { decodeBase64 } from "#parity/surfaceStatistics/decodeBase64";
import { encodeBase64 } from "#parity/surfaceStatistics/encodeBase64";

// The host's form of the input: each float array's bytes as base64, beside the sizes and label count
export interface EncodedLabelSimilarityInput extends Omit<LabelSimilarityInput, "labels" | "reference" | "shot"> {
  labels: string;
  reference: string;
  shot: string;
}
// The host's form of the output: each term map's bytes as base64
export interface EncodedLabelSimilarityOutput extends Omit<LabelSimilarityOutput, "termMaps"> {
  termMaps: { height: number; terms: string; width: number }[];
}

// The label similarities read from base64 bytes, as the page's host hands them over, and its term maps returned the same way
export const computeLabelSimilarityFromBase64 = async ({
  labels,
  reference,
  shot,
  ...rest
}: EncodedLabelSimilarityInput): Promise<EncodedLabelSimilarityOutput> => {
  const [labelBytes, referenceBytes, shotBytes] = await Promise.all([
    decodeBase64(labels),
    decodeBase64(reference),
    decodeBase64(shot),
  ]);
  const { labelSimilarities, termMaps } = await computeLabelSimilarity({
    ...rest,
    labels: new Float32Array(labelBytes),
    reference: new Float32Array(referenceBytes),
    shot: new Float32Array(shotBytes),
  });
  return {
    labelSimilarities,
    termMaps: termMaps.map(({ height, terms, width }) => ({ height, terms: encodeBase64(terms), width })),
  };
};
