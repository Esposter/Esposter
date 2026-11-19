import { RGB_CHANNEL_COUNT } from "#src/services/genshinParity/probe/constants";
import { computeTrailFrameStats } from "#src/services/genshinParity/trail/computeTrailFrameStats";
import { measureTrail } from "#src/services/genshinParity/trail/measureTrail";
import { describe, expect, test } from "vitest";

describe(measureTrail, () => {
  const WIDTH = 40;
  const HEIGHT = 20;
  const SKY: [number, number, number] = [30, 40, 70];
  const TRAIL: [number, number, number] = [210, 210, 210];
  const STRIPE_LEFT = 10;
  const SECONDS_PER_FRAME = 10;
  // A frame is the dark sky, with a vertical stripe of trail painted over it, as wide as the given number of columns
  const createFrame = (stripeWidth: number): Uint8Array => {
    const pixels = new Uint8Array(WIDTH * HEIGHT * RGB_CHANNEL_COUNT);
    for (let pixel = 0; pixel < WIDTH * HEIGHT; pixel++) {
      const column = pixel % WIDTH;
      const colour = column >= STRIPE_LEFT && column < STRIPE_LEFT + stripeWidth ? TRAIL : SKY;
      pixels.set(colour, pixel * RGB_CHANNEL_COUNT);
    }
    return pixels;
  };
  const measureFrames = (stripeWidths: number[]) =>
    measureTrail(
      stripeWidths.map((stripeWidth, index) =>
        computeTrailFrameStats(createFrame(stripeWidth), WIDTH, HEIGHT, index / SECONDS_PER_FRAME),
      ),
    );

  test("a trail's width is read from the frames its strike draws", () => {
    expect.hasAssertions();

    const STRIPE_WIDTH = 6;
    const measure = measureFrames([0, STRIPE_WIDTH, STRIPE_WIDTH, STRIPE_WIDTH, STRIPE_WIDTH, 0]);

    expect(measure?.width).toBe(STRIPE_WIDTH);
    expect(measure?.colour).toStrictEqual(TRAIL);
    expect(measure?.frames).toStrictEqual([1, 4]);
  });

  test("a trail fades over the frames after its peak", () => {
    expect.hasAssertions();

    // The stripe is full at the peak, then narrows to a third of its width, which is under half of the peak's trail
    const measure = measureFrames([0, 6, 6, 2, 0]);

    expect(measure?.frames).toStrictEqual([1, 3]);
    expect(measure?.fadeSeconds).toBeCloseTo(0.2);
  });
});
