import { computeBloomPrefilter } from "#src/post/computeBloomPrefilter";
import { GENSHIN_BLOOM_SCALER, GENSHIN_BLOOM_THRESHOLD } from "#src/renderer/constants";
import { describe, expect, test } from "vitest";

describe(computeBloomPrefilter, () => {
  test("bright stone in the login scene glows", () => {
    expect.hasAssertions();

    // A channel one above the threshold glows by the scaler, and a channel at or under the threshold does not glow
    expect(computeBloomPrefilter(GENSHIN_BLOOM_THRESHOLD + 1)).toBe(GENSHIN_BLOOM_SCALER);
    expect(computeBloomPrefilter(GENSHIN_BLOOM_THRESHOLD)).toBe(0);
    expect(computeBloomPrefilter(0)).toBe(0);
  });
});
