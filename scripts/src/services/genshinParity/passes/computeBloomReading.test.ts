import { checkIsReadingHeld } from "#src/services/genshinParity/passes/checkIsReadingHeld";
import { computeBloomReading } from "#src/services/genshinParity/passes/computeBloomReading";
import { BLOOM_READING_GATE } from "#src/services/genshinParity/passes/constants";
import { BYTE } from "#src/services/shared/constants";
import { describe, expect, test } from "vitest";

// A one-row frame of grey pixels, as the raw red, green and blue bytes a shot is read in
const createRow = (greys: number[]): Buffer => Buffer.from(greys.flatMap((grey) => [grey, grey, grey]));

describe(computeBloomReading, () => {
  test("bloom closes where it brings the brightest pixels closer", () => {
    expect.hasAssertions();

    const glow = 40;
    const width = 34;
    const height = 1;
    const middle = Array.from({ length: width - 3 }, () => 0);
    // The reference shows white at the start with a glow beside it. Its last pixel, 33 off the white, is beyond the
    // Reach the reading covers, so the drawn bloom lighting it there must not count
    const reference = createRow([BYTE, glow, ...middle, 0]);
    const unbloomed = createRow([BYTE, 0, ...middle, 0]);
    const bloomed = createRow([BYTE, glow, ...middle, BYTE]);
    const overGlown = createRow([BYTE, BYTE, ...middle, 0]);

    expect(computeBloomReading(reference, bloomed, unbloomed, width, height)).toBeCloseTo(-0.488315, 6);
    expect(computeBloomReading(reference, overGlown, unbloomed, width, height)).toBeCloseTo(2.053673, 6);
  });

  test("a bloom that reads no closer reopens its field", () => {
    expect.hasAssertions();

    // The reference shows white at the start, and the drawn bloom changes nothing, so it reads exactly none. Held only
    // Strictly below its gate, that reading holds none, and the field is re-read
    const reference = createRow([BYTE, 0, 0]);
    const unbloomed = createRow([BYTE, 0, 0]);
    const reading = computeBloomReading(reference, unbloomed, unbloomed, 3, 1);

    expect(
      checkIsReadingHeld({ gate: BLOOM_READING_GATE, name: "bloom", strict: true, unit: "ΔE", value: reading }),
    ).toBe(false);
  });
});
