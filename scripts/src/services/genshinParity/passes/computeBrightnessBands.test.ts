import { BrightnessBand } from "#src/models/genshinParity/passes/BrightnessBand";
import { computeBrightnessBands } from "#src/services/genshinParity/passes/computeBrightnessBands";
import { BYTE } from "#src/services/shared/constants";
import { describe, expect, test } from "vitest";

// A one-row frame of grey pixels, as the raw red, green and blue bytes a shot is read in
const createRow = (greys: number[]): Buffer => Buffer.from(greys.flatMap((grey) => [grey, grey, grey]));
const SCORED_ALL = (count: number): Uint8Array => new Uint8Array(count).fill(1);

describe(computeBrightnessBands, () => {
  test("reads each band's lightness error over the pixels that band holds", () => {
    expect.hasAssertions();

    // Shadow, mid and white pixels, each ours a grey the reference shows as itself, except the white, which ours shows
    // As A mid grey. The mid grey (sRGB 128) is CIELab lightness 53.6, so the white's error is 46.4 less, in the
    // Highlights
    const reference = createRow([0, 128, BYTE]);
    const ours = createRow([0, 128, 128]);
    const readings = computeBrightnessBands(reference, ours, 3, 1, SCORED_ALL(3));
    const highlights = readings.find(({ band }) => band === BrightnessBand.Highlights);
    const shadows = readings.find(({ band }) => band === BrightnessBand.Shadows);

    expect(highlights?.pixels).toBe(1);
    expect(highlights?.meanSignedError).toBeCloseTo(-46.4, 1);
    expect(highlights?.meanAbsoluteError).toBeCloseTo(46.4, 1);
    expect(shadows?.pixels).toBe(1);
    expect(shadows?.meanSignedError).toBe(0);
  });

  test("puts a pixel with any channel over the bloom's threshold in the above-threshold band", () => {
    expect.hasAssertions();

    // The threshold is 0.75 of the scene, which the curve shows at a display channel of about 208 of 255. A grey of 200
    // Is under it and a grey of 240 over it, so only the second is in the band the bloom takes
    const reference = createRow([200, 240]);
    const ours = createRow([200, 240]);
    const readings = computeBrightnessBands(reference, ours, 2, 1, SCORED_ALL(2));
    const aboveThreshold = readings.find(({ band }) => band === BrightnessBand.AboveThreshold);

    expect(aboveThreshold?.pixels).toBe(1);
  });

  test("leaves out a pixel the scored mask does not hold", () => {
    expect.hasAssertions();

    const reference = createRow([BYTE, BYTE]);
    const ours = createRow([0, 0]);
    const readings = computeBrightnessBands(reference, ours, 2, 1, Uint8Array.from([0, 1]));
    const highlights = readings.find(({ band }) => band === BrightnessBand.Highlights);

    expect(highlights?.pixels).toBe(1);
  });
});
