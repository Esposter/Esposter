import {
  BLESSING_TREE_ARTIFACT_ROWS,
  DOMAIN_TREE_COUNT_ROWS,
  findTreeRow,
} from "#src/services/genshinAssets/domains/treeRewardCounts";
import { DomainKind } from "genshin-world";
import { describe, expect, test } from "vitest";

describe("the tree count rows", () => {
  test("every row's average lies between its least and most count", () => {
    expect.hasAssertions();

    const ranges = [
      ...DOMAIN_TREE_COUNT_ROWS[DomainKind.Forgery],
      ...DOMAIN_TREE_COUNT_ROWS[DomainKind.Mastery],
    ].flatMap(({ counts }) => Object.values(counts).filter((range) => range !== undefined));
    expect(ranges.filter(({ avg, maxCount, minCount }) => avg < minCount || avg > maxCount)).toStrictEqual([]);
  });
});

describe(findTreeRow, () => {
  test("a level reads the row of the greatest Adventure Rank not above its own", () => {
    expect.hasAssertions();

    expect(findTreeRow(DOMAIN_TREE_COUNT_ROWS[DomainKind.Forgery], 35).rank).toBe(30);
    expect(findTreeRow(DOMAIN_TREE_COUNT_ROWS[DomainKind.Forgery], 40).rank).toBe(40);
    expect(findTreeRow(BLESSING_TREE_ARTIFACT_ROWS, 45).rank).toBe(45);
  });

  test("a level below every row reads the lowest row", () => {
    expect.hasAssertions();

    expect(findTreeRow(DOMAIN_TREE_COUNT_ROWS[DomainKind.Mastery], 25).rank).toBe(27);
    expect(findTreeRow(BLESSING_TREE_ARTIFACT_ROWS, 20).rank).toBe(22);
  });
});
