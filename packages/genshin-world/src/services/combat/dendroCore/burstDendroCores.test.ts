import type { DendroCore } from "#src/models/combat/DendroCore";

import { burstDendroCores } from "#src/services/combat/dendroCore/burstDendroCores";
import { describe, expect, test } from "vitest";

describe(burstDendroCores, () => {
  test("bursts the first of six cores as the sixth is left", () => {
    expect.hasAssertions();

    const dendroCores: DendroCore[] = Array.from({ length: 6 }, (_value, spawnSeconds) => ({ spawnSeconds }));
    const [firstDendroCore, ...keptDendroCores] = dendroCores;

    expect(burstDendroCores(dendroCores, 5)).toStrictEqual([firstDendroCore]);
    expect(dendroCores).toStrictEqual(keptDendroCores);
  });

  test("bursts a core six seconds after it was left", () => {
    expect.hasAssertions();

    const dendroCores: DendroCore[] = [{ spawnSeconds: 0 }, { spawnSeconds: 1 }];

    expect(burstDendroCores(dendroCores, 5.9)).toStrictEqual([]);
    expect(burstDendroCores(dendroCores, 6)).toStrictEqual([{ spawnSeconds: 0 }]);
    expect(dendroCores).toStrictEqual([{ spawnSeconds: 1 }]);
  });
});
