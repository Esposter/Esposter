import { DOMAIN_TREE_COUNT_ROWS } from "#src/services/genshinAssets/domains/constants";
import { DomainKind } from "genshin-world";
import { describe, expect, test } from "vitest";

describe("domainTreeCountRows", () => {
  test("every row's average lies between its least and most count", () => {
    expect.hasAssertions();

    const ranges = [
      ...DOMAIN_TREE_COUNT_ROWS[DomainKind.Forgery],
      ...DOMAIN_TREE_COUNT_ROWS[DomainKind.Mastery],
    ].flatMap(({ counts }) => Object.values(counts).filter((range) => range !== undefined));
    expect(ranges.filter(({ avg, maxCount, minCount }) => avg < minCount || avg > maxCount)).toStrictEqual([]);
  });
});
