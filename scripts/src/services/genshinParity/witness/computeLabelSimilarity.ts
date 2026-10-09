import type { EncodedLabelSimilarityResult } from "#src/models/genshinParity/witness/EncodedLabelSimilarityResult";
import type { LabelSimilarityInput } from "#src/models/genshinParity/witness/LabelSimilarityInput";
import type { LabelSimilarityResult } from "#src/models/genshinParity/witness/LabelSimilarityResult";
import type { Page } from "playwright";

// The bytes of a base64 float array, read as the host's floats
const decodeFloat32 = (encoded: string): Float32Array => {
  const bytes = Buffer.from(encoded, "base64");
  return new Float32Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
};
// A float array's bytes as base64, for the page to read
const encodeFloat32 = (values: Float32Array): string =>
  Buffer.from(values.buffer, values.byteOffset, values.byteLength).toString("base64");

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
