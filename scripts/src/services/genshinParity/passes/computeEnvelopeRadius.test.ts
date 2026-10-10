import { computeEnvelopeRadius } from "#src/services/genshinParity/passes/computeEnvelopeRadius";
import { describe, expect, test } from "vitest";

describe(computeEnvelopeRadius, () => {
  const SIZE = 32;
  // A block of cards with square gaps of the given side cut where given, each gap's top left corner
  const createMask = (gaps: readonly [number, number, number][]): Uint8Array => {
    const mask = new Uint8Array(SIZE * SIZE);
    for (let row = 4; row < SIZE - 4; row++)
      for (let column = 4; column < SIZE - 4; column++) mask[row * SIZE + column] = 1;
    for (const [left, top, side] of gaps)
      for (let row = top; row < top + side; row++)
        for (let column = left; column < left + side; column++) mask[row * SIZE + column] = 0;
    return mask;
  };

  test("closes the gaps each half leaves where the other half's cards stand", () => {
    expect.hasAssertions();

    const radius = computeEnvelopeRadius(
      createMask([]),
      [createMask([[8, 8, 3]]), createMask([[18, 18, 3]])],
      SIZE,
      SIZE,
    );

    expect(radius).toBe(2);
  });

  test("keeps a window every half and the whole leave open", () => {
    expect.hasAssertions();

    const window: [number, number, number] = [12, 12, 7];
    const radius = computeEnvelopeRadius(
      createMask([window]),
      [createMask([window]), createMask([window])],
      SIZE,
      SIZE,
    );

    expect(radius).toBe(1);
  });
});
