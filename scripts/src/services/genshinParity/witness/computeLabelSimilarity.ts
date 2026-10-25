import type { EncodedLabelSimilarityResult } from "#src/models/genshinParity/witness/EncodedLabelSimilarityResult";
import type { LabelSimilarityInput } from "#src/models/genshinParity/witness/LabelSimilarityInput";
import type { LabelSimilarityResult } from "#src/models/genshinParity/witness/LabelSimilarityResult";
import type { Page } from "playwright";

import { decodeFloat32 } from "#src/services/genshinParity/witness/decodeFloat32";
import { encodeFloat32 } from "#src/services/genshinParity/witness/encodeFloat32";

// Each label's similarity between two grey images, reduced on the parity page's GPU (`computeLabelSimilarity` there),
// Which the page serves beside its surface statistics. It agrees with `scoreLabelSimilarity`, the CPU reference
export const computeLabelSimilarity = async (
  page: Page,
  { height, labelCount, labels, reference, shot, width }: LabelSimilarityInput,
): Promise<LabelSimilarityResult> => {
  const encoded = await page.evaluate(
    (input) =>
      (Reflect.get(window, "computeLabelSimilarity") as (input: unknown) => Promise<EncodedLabelSimilarityResult>)(
        input,
      ),
    {
      height,
      labelCount,
      labels: encodeFloat32(Float32Array.from(labels)),
      reference: encodeFloat32(reference),
      shot: encodeFloat32(shot),
      width,
    },
  );
  return {
    labelSimilarities: encoded.labelSimilarities,
    termMaps: encoded.termMaps.map(({ height: termHeight, terms, width: termWidth }) => ({
      height: termHeight,
      terms: decodeFloat32(terms),
      width: termWidth,
    })),
  };
};
