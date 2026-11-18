import { buildFamilyLabelEnemyKindIdMap } from "#src/services/genshinAssets/camps/buildFamilyLabelEnemyKindIdMap";
import { FamilyLabelEnemyKindIdMap } from "#src/services/genshinAssets/camps/FamilyLabelEnemyKindIdMap";
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
      new Map(),
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
    const { matches, unmapped } = buildFamilyLabelEnemyKindIdMap(["Nobushi"], [HILICHURLS_PAGE], MONSTERS, new Map());
    expect(matches).toStrictEqual([]);
    expect(unmapped).toStrictEqual([{ isListed: false, label: "Nobushi" }]);
  });

  test("a family label its page lists but the world holds no kind of is reported as unheld", () => {
    expect.hasAssertions();
    const { matches, unmapped } = buildFamilyLabelEnemyKindIdMap(
      ["Hilichurl Shooter"],
      [HILICHURLS_PAGE],
      [{ id: EnemyKindId.HilichurlFighter, name: "Hilichurl" }],
      new Map(),
    );
    expect(matches).toStrictEqual([]);
    expect(unmapped).toStrictEqual([{ isListed: true, label: "Hilichurl Shooter" }]);
  });

  test("a family label whose wiki title redirects to a title its page lists maps to a kind of that title", () => {
    expect.hasAssertions();
    const { matches } = buildFamilyLabelEnemyKindIdMap(
      ["Hilichurl Chieftain"],
      [{ content: "[[Lawachurls]] [[Frostarm Lawachurl]]", title: "Hilichurls" }],
      [{ id: EnemyKindId.FrostarmLawachurl, name: "Frostarm Lawachurl" }],
      new Map([["Hilichurl Chieftain", "Lawachurl"]]),
    );
    expect(matches).toStrictEqual([
      {
        kindId: EnemyKindId.FrostarmLawachurl,
        label: "Hilichurl Chieftain",
        page: "Hilichurls",
        variant: "Lawachurls",
      },
    ]);
  });

  test("the generated map covers every label the hand map covered", () => {
    expect.hasAssertions();
    // The labels the hand-written map gave a kind before the map was generated, read from git at 1dbb2ffff1
    const HAND_MAP_LABELS = [
      "Abyss Herald",
      "Abyss Mage",
      "Aeonblight Drake",
      "Algorithm of Semi-Intransient Matrix of Overseer Network",
      "Avatars of Lava",
      "Bathysmal Vishap",
      "Breacher Primus",
      "Emperor of Fire and Iron",
      "Experimental Field Generator",
      "Eye of the Storm",
      "Fatui Agent",
      "Fatui Mirror Maiden",
      "Fatui Skirmisher",
      "Fungi",
      "Geovishap",
      "Geovishap Hatchling",
      "Gluttonous Yumkasaur Mountain King",
      "Golden Wolflord",
      "Goldflame Qucusaur Tyrant",
      "Hilichurl",
      "Hilichurl Chieftain",
      "Hilichurl Rogue",
      "Hilichurl Shooter",
      "Hydro Tulpa",
      "Icewind Suite",
      "Iniquitous Baptist",
      "Jadeplume Terrorshroom",
      "Legatus Golem",
      "Maguu Kenki",
      "Millennial Pearl Seahorse",
      "Mitachurl",
      "Nobushi",
      "Perpetual Mechanical Array",
      "Praetorian Golem",
      "Primal Construct",
      "Primo Geovishap",
      "Ruin Drake",
      "Samachurl",
      "Secret Source Automaton: Configuration Device",
      "Secret Source Automaton: Hunter-Seeker",
      "Setekh Wenut",
      "Slime",
      "Solitary Suanni",
      "Specter",
      "Thunder Manifestation",
      "Treasure Hoarder",
      "Wayob Manifestations",
      "Wayward Hermetic Spiritspeaker",
      "Whopperflower",
      "Xuanwen Beast",
    ];
    expect(HAND_MAP_LABELS.filter((label) => !Object.hasOwn(FamilyLabelEnemyKindIdMap, label))).toStrictEqual([]);
  });
});
