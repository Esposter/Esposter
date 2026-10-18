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

  test("geo damage is blunt, by the element the hit deals over the character's own", () => {
    expect.hasAssertions();

    const geoCombatant = { ...combatant, element: Element.Geo };

    expect(readOreHit(geoCombatant, hit).isBlunt).toBe(true);
    expect(readOreHit(geoCombatant, { ...hit, element: Element.Pyro }).isBlunt).toBe(false);
    expect(readOreHit(combatant, { ...hit, element: Element.Geo }).isBlunt).toBe(true);
  });

  test("a kit's own blunt flag does not make a hit blunt", () => {
    expect.hasAssertions();

    expect(readOreHit(combatant, { ...hit, actionAttackTag: AttackTag.NormalAttack, isBlunt: true }).isBlunt).toBe(
      false,
    );
  });
});
