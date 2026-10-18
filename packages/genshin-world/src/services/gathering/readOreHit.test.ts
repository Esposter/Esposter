import type { Combatant } from "#src/models/kit/Combatant";
import type { KitHit } from "#src/models/kit/KitHit";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readOreHit } from "#src/services/gathering/readOreHit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const GOROU_CHARACTER_ID = 10_000_055;
const KLEE_CHARACTER_ID = 10_000_029;
const NINGGUANG_CHARACTER_ID = 10_000_027;
const YUN_JIN_CHARACTER_ID = 10_000_064;
const ZHONGLI_CHARACTER_ID = 10_000_030;

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(readOreHit, () => {
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

  test.each<[AttackTag | undefined, WeaponType, boolean]>([
    [AttackTag.NormalAttack, WeaponType.Sword, true],
    [AttackTag.ChargedAttack, WeaponType.Claymore, true],
    [AttackTag.PlungingAttack, WeaponType.Sword, false],
    [AttackTag.NormalAttack, WeaponType.Bow, false],
    [undefined, WeaponType.Polearm, false],
  ])("reads a hit in a %s action of a %s wielder as melee: %s", (actionAttackTag, weaponType, isMelee) => {
    expect.hasAssertions();

    // The kind the hit is dealt as is not the one read: a normal attack's hit dealt as a skill's is still melee
    expect(
      readOreHit({ ...combatant, weaponType }, { ...hit, actionAttackTag, attackTag: AttackTag.ElementalSkill })
        .isMelee,
    ).toBe(isMelee);
  });

  test("a claymore's normal and charged attacks are blunt, a sword's are not", () => {
    expect.hasAssertions();

    const claymore = { ...combatant, weaponType: WeaponType.Claymore };

    expect(readOreHit(claymore, { ...hit, actionAttackTag: AttackTag.NormalAttack }).isBlunt).toBe(true);
    expect(readOreHit(claymore, { ...hit, actionAttackTag: AttackTag.ChargedAttack }).isBlunt).toBe(true);
    expect(readOreHit(combatant, { ...hit, actionAttackTag: AttackTag.NormalAttack }).isBlunt).toBe(false);
  });

  test("a plunge by a sword, a claymore or a polearm is blunt, a catalyst's is not", () => {
    expect.hasAssertions();

    const plunge = { ...hit, actionAttackTag: AttackTag.PlungingAttack };

    expect(readOreHit(combatant, plunge).isBlunt).toBe(true);
    expect(readOreHit({ ...combatant, weaponType: WeaponType.Claymore }, plunge).isBlunt).toBe(true);
    expect(readOreHit({ ...combatant, weaponType: WeaponType.Polearm }, plunge).isBlunt).toBe(true);
    expect(readOreHit({ ...combatant, weaponType: WeaponType.Catalyst }, plunge).isBlunt).toBe(false);
  });

  test("a geo character's physical normal attack does not break ore, its plunge by a polearm does", () => {
    expect.hasAssertions();

    const zhongli: Combatant = {
      ...combatant,
      characterId: ZHONGLI_CHARACTER_ID,
      element: Element.Geo,
      weaponType: WeaponType.Polearm,
    };

    expect(readOreHit(zhongli, { ...hit, actionAttackTag: AttackTag.NormalAttack }).isBlunt).toBe(false);
    expect(readOreHit(zhongli, { ...hit, actionAttackTag: AttackTag.PlungingAttack }).isBlunt).toBe(true);
  });

  test("geo damage is blunt, by the element the hit deals over the character's own", () => {
    expect.hasAssertions();

    expect(readOreHit(combatant, { ...hit, element: Element.Geo }).isBlunt).toBe(true);
    expect(readOreHit({ ...combatant, element: Element.Geo }, { ...hit, element: Element.Pyro }).isBlunt).toBe(false);
  });

  test("klee's kaboom normal and charged attacks are blunt, as the wiki's blunt table lists them", () => {
    expect.hasAssertions();

    const klee: Combatant = {
      ...combatant,
      characterId: KLEE_CHARACTER_ID,
      element: Element.Pyro,
      weaponType: WeaponType.Catalyst,
    };

    expect(readOreHit(klee, { ...hit, actionAttackTag: AttackTag.NormalAttack }).isBlunt).toBe(true);
    expect(readOreHit(klee, { ...hit, actionAttackTag: AttackTag.ChargedAttack }).isBlunt).toBe(true);
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
      readOreHit(ningguang, { ...hit, actionAttackTag: AttackTag.PlungingAttack, element: Element.Geo }).isBlunt,
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

    expect(readOreHit(gorou, { ...hit, actionAttackTag: AttackTag.ChargedAttack, element: Element.Geo }).isBlunt).toBe(
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

    expect(
      readOreHit(yunJin, { ...hit, actionAttackTag: AttackTag.ElementalBurst, element: Element.Geo }).isBlunt,
    ).toBe(true);
    expect(
      readOreHit(yunJin, { ...hit, actionAttackTag: AttackTag.ElementalSkill, element: Element.Geo }).isBlunt,
    ).toBe(false);
  });

  test("a kit's own blunt flag does not make a hit blunt", () => {
    expect.hasAssertions();

    expect(readOreHit(combatant, { ...hit, actionAttackTag: AttackTag.NormalAttack, isBlunt: true }).isBlunt).toBe(
      false,
    );
  });
});
