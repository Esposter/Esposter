import { computeBloomReading } from "#src/services/genshinParity/passes/computeBloomReading";
import { BYTE } from "#src/services/shared/constants";
import { describe, expect, test } from "vitest";

// A one-row frame of grey pixels, as the raw red, green and blue bytes a shot is read in
const createRow = (greys: number[]): Buffer => Buffer.from(greys.flatMap((grey) => [grey, grey, grey]));

describe(computeBloomReading, () => {
  test("Bloom closes where it brings the brightest pixels closer", () => {
    expect.hasAssertions();

    const glow = 40;
    const width = 34;
    const height = 1;
    const middle = Array<number>(width - 3).fill(0);
    // The reference shows white at the start with a glow beside it. Its last pixel, 33 off the white, is beyond the
    // reach the reading covers, so the drawn bloom lighting it there must not count
    const reference = createRow([BYTE, glow, ...middle, 0]);
    const unbloomed = createRow([BYTE, 0, ...middle, 0]);
    const bloomed = createRow([BYTE, glow, ...middle, BYTE]);
    const overGlown = createRow([BYTE, BYTE, ...middle, 0]);

    expect(computeBloomReading(reference, bloomed, unbloomed, width, height)).toBeLessThan(0);
    expect(computeBloomReading(reference, overGlown, unbloomed, width, height)).toBeGreaterThan(0);
  });
});
