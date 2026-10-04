import { orderByViewDepth } from "#src/atmosphere/orderByViewDepth";
import { placeCloudBand } from "#src/atmosphere/placeCloudBand";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { Matrix4 } from "three";
import { describe, test } from "vitest";

// A band of clouds and four times as many: the order is kept every frame, and its cost must follow the band
const BENCH_CLOUD_COUNTS = [256, 1024];
const modelViewMatrix = new Matrix4();
// The order a still camera leaves against the one a camera turned right round finds, every cloud behind every other
describe(orderByViewDepth, () => {
  test.for(BENCH_CLOUD_COUNTS)("%i clouds", async (count, { bench }) => {
    const places = placeCloudBand(
      { count, distanceRange: [100, 1000], heightRange: [0, 100], seed: 0, widthRange: [1, 1] },
      1,
    ).map(({ position }) => position);
    const depths = new Float64Array(count);
    const settledOrder = Uint32Array.from({ length: count }, (_value, index) => index);
    orderByViewDepth(places, modelViewMatrix, depths, settledOrder);
    const turnedOrder = settledOrder.toReversed();
    const order = new Uint32Array(count);
    await bench.compare(
      bench("settled", () => {
        order.set(settledOrder);
        orderByViewDepth(places, modelViewMatrix, depths, order);
      }),
      bench("turned", () => {
        order.set(turnedOrder);
        orderByViewDepth(places, modelViewMatrix, depths, order);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
