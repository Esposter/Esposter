import { buildFamilyLabelEnemyKindIdMap } from "#src/services/genshinAssets/camps/buildFamilyLabelEnemyKindIdMap";
import { EnemyKindId } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(buildFamilyLabelEnemyKindIdMap, () => {
  // A family page's links, its variants among them, as the wiki's Hilichurls page links them in its galleries
  const HILICHURLS_PAGE = {
    content:
      "[[Hilichurl]] [[Hilichurl Shooter]] [[Hilichurls]] [[Dendro Samachurl|Dendro]] [[Pyro Hilichurl Shooter]]",
    title: "Hilichurls",
  };

  // The monsters the dump names by English name under their monster ids
  const MONSTERS = [
    { id: EnemyKindId.HilichurlFighter, name: "Hilichurl" },
    { id: EnemyKindId.HilichurlShooter, name: "Hilichurl Shooter" },
    { id: EnemyKindId.DendroSamachurl, name: "Dendro Samachurl" },
    { id: 21_010_201, name: "Pyro Hilichurl Shooter" },
  ];

  test("every family label a camp names maps to a variant its page lists", () => {
    expect.hasAssertions();
    const { matches, unmapped } = buildFamilyLabelEnemyKindIdMap(
      ["Hilichurl", "Hilichurl Shooter", "Samachurl"],
      [HILICHURLS_PAGE],
      MONSTERS,
    );
    expect(matches).toStrictEqual([
      { kindId: EnemyKindId.HilichurlFighter, label: "Hilichurl", page: "Hilichurls", variant: "Hilichurl" },
      {
        kindId: EnemyKindId.HilichurlShooter,
        label: "Hilichurl Shooter",
        page: "Hilichurls",
        variant: "Hilichurl Shooter",
      },
      { kindId: EnemyKindId.DendroSamachurl, label: "Samachurl", page: "Hilichurls", variant: "Dendro Samachurl" },
    ]);
    expect(unmapped).toStrictEqual([]);
  });

  test("a family label no variant of its page matches is reported", () => {
    expect.hasAssertions();
    const { matches, unmapped } = buildFamilyLabelEnemyKindIdMap(["Nobushi"], [HILICHURLS_PAGE], MONSTERS);
    expect(matches).toStrictEqual([]);
    expect(unmapped).toStrictEqual(["Nobushi"]);
  });
});
