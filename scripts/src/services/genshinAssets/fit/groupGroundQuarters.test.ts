import type { GroundPieceFit } from "#src/models/genshinAssets/fit/GroundPieceFit";

import { groupGroundQuarters } from "#src/services/genshinAssets/fit/groupGroundQuarters";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

// A fit of a quarter or a group of quarters over the samples it reads, held or not
const createFit = (sampleCount: number, isHeld: boolean): GroundPieceFit => ({
  build: { notes: [], objects: {} },
  isHeld,
  key: "ground/test/quarter",
  sampleCount,
});

describe(groupGroundQuarters, () => {
  test("joins an undersized quarter to the edge-sharing sibling with the fewest samples whose group holds", async () => {
    expect.hasAssertions();

    // Quarter 3's edge-sharing siblings are 1 and 2, and quarter 0, diagonal from it, reads the fewest of all, so it is
    // Not the one joined. Every group holds, so quarter 2, the fewer-sampled of 1 and 2, is the one joined
    const fits = [createFit(1500, true), createFit(5000, true), createFit(2000, true), createFit(432, false)];
    const groups = await groupGroundQuarters(fits, 1024, () => Promise.resolve(createFit(2432, true)));

    expect(groups.map(({ indices }) => indices)).toStrictEqual([[0], [1], [2, 3]]);
  });

  test("keeps every quarter alone when none reads under the minimum", async () => {
    expect.hasAssertions();

    // A group fitted would reject, so the test fails if one is asked for
    const fits = [createFit(1500, true), createFit(5000, true), createFit(2000, true), createFit(1024, true)];
    const groups = await groupGroundQuarters(fits, 1024, () => Promise.reject(new Error(" ")));

    expect(groups).toStrictEqual(fits.map((fit, index) => ({ fit, indices: [index] })));
  });

  test("does not take a held sibling into a pair that misses, when another sibling's pair holds", async () => {
    expect.hasAssertions();

    // Quarter 2, the fewer-sampled of quarter 3's siblings, holds alone, and its pair with 3 misses. The pair of 1 and
    // 3 holds, so 1 joins 3 and quarter 2 keeps its own result
    const fits = [createFit(1500, true), createFit(5000, true), createFit(2000, true), createFit(432, false)];
    const pairFit = createFit(5432, true);
    const groups = await groupGroundQuarters(fits, 1024, (indices) =>
      Promise.resolve(indices.includes(1) ? pairFit : createFit(2432, false)),
    );

    expect(groups).toStrictEqual([
      { fit: takeOne(fits, 0), indices: [0] },
      { fit: pairFit, indices: [1, 3] },
      { fit: takeOne(fits, 2), indices: [2] },
    ]);
  });

  test("keeps the held siblings' own results when no pair holds, and refuses the undersized quarter", async () => {
    expect.hasAssertions();

    // Both pairs miss, so quarter 3 joins neither, and quarters 0, 1 and 2 keep the results they fitted alone
    const fits = [createFit(1500, true), createFit(5000, true), createFit(2000, true), createFit(432, false)];
    const groups = await groupGroundQuarters(fits, 1024, () => Promise.resolve(createFit(2432, false)));

    expect(groups).toStrictEqual(fits.map((fit, index) => ({ fit, indices: [index] })));
  });

  test("keeps an undersized pair joining until a group of three holds", async () => {
    expect.hasAssertions();

    // Quarters 0 and 1 read under the minimum and share an edge, so their pair is still under it and joins the sibling
    // Sharing an edge with it that reads the fewest samples, quarter 2, whose three hold
    const fits = [createFit(300, false), createFit(400, false), createFit(5000, true), createFit(6000, true)];
    const triple = createFit(5300, true);
    const groups = await groupGroundQuarters(fits, 1024, (indices) =>
      Promise.resolve(indices.length === 3 ? triple : createFit(700, false)),
    );

    expect(groups).toStrictEqual([
      { fit: triple, indices: [0, 1, 2] },
      { fit: takeOne(fits, 3), indices: [3] },
    ]);
  });
});
