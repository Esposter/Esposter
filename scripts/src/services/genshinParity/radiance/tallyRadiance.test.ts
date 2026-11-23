import type { RadianceFrames } from "#src/models/genshinParity/radiance/RadianceFrames";

import { RadianceLight } from "#src/models/genshinParity/radiance/RadianceLight";
import { mergeRadianceTallies } from "#src/services/genshinParity/radiance/mergeRadianceTallies";
import { OUTSIDE_PARTS, tallyRadiance } from "#src/services/genshinParity/radiance/tallyRadiance";
import { toRadianceRows } from "#src/services/genshinParity/radiance/toRadianceRows";
import { BYTE } from "#src/services/shared/constants";
import { toSrgb } from "#src/services/shared/toSrgb";
import { toneMapGenshin } from "genshin-engine";
import { describe, expect, test } from "vitest";

// A one-row frame of grey pixels, as the raw red, green and blue bytes a shot is read in
const createRow = (greys: number[]): Buffer => Buffer.from(greys.flatMap((grey) => [grey, grey, grey]));
// A one-row frame of the masks, one value per pixel
const createMask = (values: number[]): Float32Array => Float32Array.from(values);

const createFrames = (overrides: Partial<RadianceFrames>): RadianceFrames => ({
  families: ["Walkway"],
  family: createMask([0, 0]),
  height: 1,
  ours: createRow([128, 128]),
  reference: createRow([128, 128]),
  scored: new Uint8Array([1, 1]),
  shadow: createMask([1, 0]),
  width: 2,
  ...overrides,
});

describe(tallyRadiance, () => {
  test("sorts each scored pixel into its family's lit or shaded tally and into the whole", () => {
    expect.hasAssertions();

    // The first pixel stands in the family's sun, the second in its shadow, and both are the same grey on both frames
    const tallies = tallyRadiance(createFrames({ shadow: createMask([1, 0]) }));
    const walkway = tallies.filter(({ family }) => family === "Walkway");
    const lit = walkway.find(({ light }) => light === RadianceLight.Lit);
    const shaded = walkway.find(({ light }) => light === RadianceLight.Shaded);
    const whole = walkway.find(({ light }) => light === RadianceLight.All);

    expect(lit?.pixels).toBe(1);
    expect(shaded?.pixels).toBe(1);
    expect(whole?.pixels).toBe(2);
  });

  test("drops a pixel a channel saturates on either frame, and counts it as clipped", () => {
    expect.hasAssertions();

    // The second pixel is white on the reference, where the curve's white hides how bright the radiance is
    const tallies = tallyRadiance(createFrames({ reference: createRow([128, BYTE]) }));
    const whole = tallies.find(({ light }) => light === RadianceLight.All);

    expect(whole?.pixels).toBe(1);
    expect(whole?.clipped).toBe(1);
  });

  test("reads a pixel no part stands at under the outside family, and skips an unscored pixel", () => {
    expect.hasAssertions();

    const tallies = tallyRadiance(createFrames({ family: createMask([-1, 0]), scored: new Uint8Array([1, 0]) }));
    const outside = tallies.find(({ family }) => family === OUTSIDE_PARTS);
    const walkway = tallies.find(({ family }) => family === "Walkway");

    expect(outside?.pixels).toBe(1);
    expect(walkway).toBeUndefined();
  });
});

describe(mergeRadianceTallies, () => {
  test("pools the references' counts and sums family by family", () => {
    expect.hasAssertions();

    const one = tallyRadiance(createFrames({}));
    const pooled = mergeRadianceTallies([one, one]);
    const whole = pooled.find(({ light }) => light === RadianceLight.All);

    expect(whole?.pixels).toBe(4);
    expect(whole?.ours[0]).toBeCloseTo(2 * (one.find(({ light }) => light === RadianceLight.All)?.ours[0] ?? 0));
  });
});

describe(toRadianceRows, () => {
  test("reads ours over the reference, and each channel's own ratio", () => {
    expect.hasAssertions();

    // Ours is the reference's grey brightened to a white of 200 on the one pixel, so its ratio is above one in every
    // Channel
    const tallies = tallyRadiance(createFrames({ ours: createRow([200, 128]) }));
    const whole = toRadianceRows(tallies).find(({ light }) => light === RadianceLight.All);

    expect(whole?.ratio).toBeGreaterThan(1);
    expect(whole?.channelRatios[0]).toBeCloseTo(whole?.ratio ?? 0, 6);
  });

  test("recovers the radiance a tone-mapped grey was drawn from, to the byte's quantisation", () => {
    expect.hasAssertions();

    // A grey of scene radiance 1 is drawn by the curve at its display value, encoded to a byte, and read back to within
    // One byte, the most the encoding rounds it by
    const [drawn] = toneMapGenshin([1, 1, 1]);
    const byte = Math.round(toSrgb(drawn ?? 0) * BYTE);
    const tallies = tallyRadiance(createFrames({ ours: createRow([byte, byte]), reference: createRow([byte, byte]) }));
    const whole = toRadianceRows(tallies).find(({ light }) => light === RadianceLight.All);

    expect(whole?.referenceMean).toBeCloseTo(1, 1);
    expect(whole?.ratio).toBeCloseTo(1, 6);
  });
});
