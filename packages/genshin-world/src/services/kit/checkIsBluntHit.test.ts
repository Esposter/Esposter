import type { Combatant } from "#src/models/kit/Combatant";
import type { KitHit } from "#src/models/kit/KitHit";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { checkIsBluntHit } from "#src/services/kit/checkIsBluntHit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const GOROU_CHARACTER_ID = 10_000_055;
const KLEE_CHARACTER_ID = 10_000_029;
const NINGGUANG_CHARACTER_ID = 10_000_027;
const YUN_JIN_CHARACTER_ID = 10_000_064;
const ZHONGLI_CHARACTER_ID = 10_000_030;

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(checkIsBluntHit, () => {
  const combatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 90,
    weaponType: WeaponType.Sword,
  };
  const hit: KitHit = {
    hitArea: { angle: 2 * Math.PI, height: 2, radius: 1 },
    hitmarkSeconds: 0,
    poiseDamage: 1,
    talentMultiplier: 1,
  };

  test("a claymore's normal and charged attacks are blunt, a sword's are not", () => {
    expect.hasAssertions();

    const claymore = { ...combatant, weaponType: WeaponType.Claymore };

    expect(checkIsBluntHit(claymore, { ...hit, actionAttackTag: AttackTag.NormalAttack })).toBe(true);
    expect(checkIsBluntHit(claymore, { ...hit, actionAttackTag: AttackTag.ChargedAttack })).toBe(true);
    expect(checkIsBluntHit(combatant, { ...hit, actionAttackTag: AttackTag.NormalAttack })).toBe(false);
  });

  test("a plunge by a sword, a claymore or a polearm is blunt, a catalyst's is not", () => {
    expect.hasAssertions();

    const plunge = { ...hit, actionAttackTag: AttackTag.PlungingAttack };

    expect(checkIsBluntHit(combatant, plunge)).toBe(true);
    expect(checkIsBluntHit({ ...combatant, weaponType: WeaponType.Claymore }, plunge)).toBe(true);
    expect(checkIsBluntHit({ ...combatant, weaponType: WeaponType.Polearm }, plunge)).toBe(true);
    expect(checkIsBluntHit({ ...combatant, weaponType: WeaponType.Catalyst }, plunge)).toBe(false);
  });

  test("a geo character's physical normal attack is not blunt, its plunge by a polearm is", () => {
    expect.hasAssertions();

    const zhongli: Combatant = {
      ...combatant,
      characterId: ZHONGLI_CHARACTER_ID,
      element: Element.Geo,
      weaponType: WeaponType.Polearm,
    };

    expect(checkIsBluntHit(zhongli, { ...hit, actionAttackTag: AttackTag.NormalAttack })).toBe(false);
    expect(checkIsBluntHit(zhongli, { ...hit, actionAttackTag: AttackTag.PlungingAttack })).toBe(true);
  });

  test("geo damage is blunt, by the element the hit deals over the character's own", () => {
    expect.hasAssertions();

    expect(checkIsBluntHit(combatant, { ...hit, element: Element.Geo })).toBe(true);
    expect(checkIsBluntHit({ ...combatant, element: Element.Geo }, { ...hit, element: Element.Pyro })).toBe(false);
  });

  test("a geo traveler's skill, which takes its wielder's element, is blunt, an anemo one is not", () => {
    expect.hasAssertions();

    const skill = takeOne(TRAVELER_KIT.elementalSkill.hits, 0);

    expect(checkIsBluntHit({ ...combatant, element: Element.Geo }, skill)).toBe(true);
    expect(checkIsBluntHit({ ...combatant, element: Element.Anemo }, skill)).toBe(false);
  });

  test("klee's kaboom normal and charged attacks are blunt, as the wiki's blunt table lists them", () => {
    expect.hasAssertions();

    const klee: Combatant = {
      ...combatant,
      characterId: KLEE_CHARACTER_ID,
      element: Element.Pyro,
      weaponType: WeaponType.Catalyst,
    };

    expect(checkIsBluntHit(klee, { ...hit, actionAttackTag: AttackTag.NormalAttack })).toBe(true);
    expect(checkIsBluntHit(klee, { ...hit, actionAttackTag: AttackTag.ChargedAttack })).toBe(true);
  });

  test("ningguang's plunge is not blunt, though it deals geo damage, as the wiki's blunt table excepts it", () => {
    expect.hasAssertions();

    const ningguang: Combatant = {
      ...combatant,
      characterId: NINGGUANG_CHARACTER_ID,
      element: Element.Geo,
      weaponType: WeaponType.Catalyst,
    };

    expect(
      checkIsBluntHit(ningguang, { ...hit, actionAttackTag: AttackTag.PlungingAttack, element: Element.Geo }),
    ).toBe(false);
  });

  test("gorou's charged attack is not blunt, though it deals geo damage, as the wiki's blunt table excepts it", () => {
    expect.hasAssertions();

    const gorou: Combatant = {
      ...combatant,
      characterId: GOROU_CHARACTER_ID,
      element: Element.Geo,
      weaponType: WeaponType.Bow,
    };

    expect(checkIsBluntHit(gorou, { ...hit, actionAttackTag: AttackTag.ChargedAttack, element: Element.Geo })).toBe(
      false,
    );
  });

  test("yun jin's cliffbreaker's banner is blunt and her opening flourish is not, both deal geo damage", () => {
    expect.hasAssertions();

    const yunJin: Combatant = {
      ...combatant,
      characterId: YUN_JIN_CHARACTER_ID,
      element: Element.Geo,
      weaponType: WeaponType.Polearm,
    };

    expect(checkIsBluntHit(yunJin, { ...hit, actionAttackTag: AttackTag.ElementalBurst, element: Element.Geo })).toBe(
      true,
    );
    expect(checkIsBluntHit(yunJin, { ...hit, actionAttackTag: AttackTag.ElementalSkill, element: Element.Geo })).toBe(
      false,
    );
  });
});
