import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";

import { KitRule } from "#src/models/genshinAssets/kits/KitRule";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { getBluntKitCandidates } from "#src/services/genshinAssets/kits/candidates/getBluntKitCandidates";
import { Element, WeaponType } from "genshin-world";
import { describe, expect, test } from "vitest";

const getValue = (candidateMap: Map<string, KitCandidate[]>, path: string) => candidateMap.get(path)?.[0]?.value;

describe(getBluntKitCandidates, () => {
  const CLAYMORE_CHARACTER_ID = 10_000_003;
  const HITMARK_FRAMES = 12;

  test("a claymore's normal attack is blunt, a sword's is not", () => {
    expect.hasAssertions();

    const valueMap = new Map<string, unknown>([["normalAttacks.0.hits.0.hitmarkFrames", HITMARK_FRAMES]]);
    const claymore = { characterId: CLAYMORE_CHARACTER_ID, weaponType: WeaponType.Claymore };
    const sword = { characterId: CLAYMORE_CHARACTER_ID, weaponType: WeaponType.Sword };

    expect(getValue(getBluntKitCandidates(valueMap, claymore), "normalAttacks.0.hits.0.isBlunt")).toBe(true);
    expect(getValue(getBluntKitCandidates(valueMap, sword), "normalAttacks.0.hits.0.isBlunt")).toBe(false);
  });

  test("a melee plunge is blunt, a catalyst's is not", () => {
    expect.hasAssertions();

    const valueMap = new Map<string, unknown>([["plunges.low.hits.0.hitmarkFrames", HITMARK_FRAMES]]);

    expect(
      getValue(
        getBluntKitCandidates(valueMap, { characterId: CLAYMORE_CHARACTER_ID, weaponType: WeaponType.Polearm }),
        "plunges.low.hits.0.isBlunt",
      ),
    ).toBe(true);
    expect(
      getValue(
        getBluntKitCandidates(valueMap, { characterId: CLAYMORE_CHARACTER_ID, weaponType: WeaponType.Catalyst }),
        "plunges.low.hits.0.isBlunt",
      ),
    ).toBe(false);
  });

  test("a Geo character's excepted plunge is non-blunt, and names its Geo", () => {
    expect.hasAssertions();

    const valueMap = new Map<string, unknown>([
      ["plunges.low.hits.0.gauge", 1],
      ["plunges.low.hits.0.hitmarkFrames", HITMARK_FRAMES],
    ]);
    const candidateMap = getBluntKitCandidates(valueMap, {
      characterId: 10_000_027,
      element: Element.Geo,
      weaponType: WeaponType.Catalyst,
    });

    expect(getValue(candidateMap, "plunges.low.hits.0.isBlunt")).toBe(false);
    expect(candidateMap.get("plunges.low.hits.0.element")?.[0]?.provenance).toStrictEqual({
      rule: KitRule.NonBluntGeoElement,
      source: KitSource.Rule,
    });
  });

  test("the override names the second normal attack's hit of a character, and not the first", () => {
    expect.hasAssertions();

    const valueMap = new Map<string, unknown>([
      ["normalAttacks.0.hits.0.hitmarkFrames", HITMARK_FRAMES],
      ["normalAttacks.1.hits.0.hitmarkFrames", HITMARK_FRAMES],
    ]);
    const candidateMap = getBluntKitCandidates(valueMap, {
      characterId: 10_000_072,
      element: Element.Hydro,
      weaponType: WeaponType.Polearm,
    });

    expect(getValue(candidateMap, "normalAttacks.0.hits.0.isBlunt")).toBe(false);
    expect(getValue(candidateMap, "normalAttacks.1.hits.0.isBlunt")).toBe(true);
  });

  test("the traveler's skill names its element, so it is not blunt and takes no Geo from the rule", () => {
    expect.hasAssertions();

    const valueMap = new Map<string, unknown>([
      ["skill.hits.0.element", Element.Anemo],
      ["skill.hits.0.gauge", 1],
      ["skill.hits.0.hitmarkFrames", HITMARK_FRAMES],
    ]);
    const candidateMap = getBluntKitCandidates(valueMap, { characterId: 10_000_007, weaponType: WeaponType.Sword });

    expect(getValue(candidateMap, "skill.hits.0.isBlunt")).toBe(false);
    expect(candidateMap.has("skill.hits.0.element")).toBe(false);
  });
});
