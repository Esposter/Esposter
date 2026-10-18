import { describe, expect, test } from "vitest";

import { createTileWorkerLedger } from "#src/services/world/createTileWorkerLedger";

describe(createTileWorkerLedger, () => {
  test("a worker's error fails only the tiles it holds", () => {
    expect.hasAssertions();

    const tileWorkerLedger = createTileWorkerLedger();
    tileWorkerLedger.assign(1, 0);
    tileWorkerLedger.assign(2, 1);
    tileWorkerLedger.assign(3, 0);
    expect(tileWorkerLedger.keysOf(0)).toStrictEqual([1, 3]);
    expect(tileWorkerLedger.keysOf(1)).toStrictEqual([2]);
  });

  test("a tile answered by a worker it was not asked of stays held by the worker it was", () => {
    expect.hasAssertions();

    const tileWorkerLedger = createTileWorkerLedger();
    tileWorkerLedger.assign(7, 0);
    tileWorkerLedger.assign(7, 1);
    tileWorkerLedger.release(7, 0);
    expect(tileWorkerLedger.keysOf(1)).toStrictEqual([7]);
    expect(tileWorkerLedger.keysOf(0)).toStrictEqual([]);
  });

  test("a tile its worker answers is no longer held", () => {
    expect.hasAssertions();

    const tileWorkerLedger = createTileWorkerLedger();
    tileWorkerLedger.assign(7, 0);
    tileWorkerLedger.release(7, 0);
    expect(tileWorkerLedger.keysOf(0)).toStrictEqual([]);
  });
});
