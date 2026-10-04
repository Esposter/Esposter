import { scoreFlip } from "#src/services/genshinParity/shared/scoreFlip";
import { describe, expect, test } from "vitest";

describe(scoreFlip, () => {
  test("matches NVIDIA's own evaluator on a gradient with a square of other colours in it", () => {
    expect.hasAssertions();

    // A red-green ramp over half blue, and the same with an eight-pixel square of another colour in its middle, scored
    // By `flip_evaluator.evaluate(reference, test, "LDR")` at its default viewing distance
    const width = 24;
    const height = 16;
    const reference = new Float32Array(width * height * 3);
    const shot = new Float32Array(width * height * 3);
    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        const pixel = (y * width + x) * 3;
        reference.set([x / (width - 1), y / (height - 1), 0.5], pixel);
        shot.set(
          x >= 8 && x < 16 && y >= 4 && y < 12
            ? [1 - x / (width - 1), 0.25, 0.75]
            : [x / (width - 1), y / (height - 1), 0.5],
          pixel,
        );
      }

    const { errorMap, mean } = scoreFlip(reference, shot, width, height);

    expect(mean).toBeCloseTo(0.2602258026599884, 5);
    expect(errorMap[8 * width + 12]).toBeCloseTo(0.8953410387039185, 5);
    expect(errorMap[0]).toBeCloseTo(0.0012330081081017852, 5);
  });
});
