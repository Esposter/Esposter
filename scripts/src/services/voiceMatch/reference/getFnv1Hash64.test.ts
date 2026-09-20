import { FNV1_64_OFFSET_BASIS } from "#src/services/voiceMatch/constants";
import { getFnv1Hash64 } from "#src/services/voiceMatch/reference/getFnv1Hash64";
import { describe, expect, test } from "vitest";

describe(getFnv1Hash64, () => {
  test("hashes nothing to the offset basis", () => {
    expect.hasAssertions();

    expect(getFnv1Hash64("")).toBe(FNV1_64_OFFSET_BASIS);
  });

  test("multiplies before it xors, which is FNV-1 and not FNV-1a", () => {
    expect.hasAssertions();

    // The published FNV-1 64-bit vector for one byte; FNV-1a gives 0xaf63dc4c8601ec8c for the same input
    expect(getFnv1Hash64("a")).toBe(0xaf_63_bd_4c_86_01_b7_ben);
  });
});
