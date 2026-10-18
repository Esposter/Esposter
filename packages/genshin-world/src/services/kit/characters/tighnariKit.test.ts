import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createTighnariKitBehaviour, TIGHNARI_CHARACTER_ID } from "#src/services/kit/characters/tighnariKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TIGHNARI_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TIGHNARI_CHARACTER_ID);
const OTHER_CHARACTER_ID = 10_000_042;
const createTighnariCombatant = (ascension: number, elementalMastery: number): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([
    { attribute: Attribute.BaseHealth, value: 10_000 },
    { attribute: Attribute.ElementalMastery, value: elementalMastery },
  ]),
  characterId: TIGHNARI_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TIGHNARI_KIT,
  level: 90,
  weaponType: WeaponType.Bow,
});

// The buffs the burst gives the party as it starts, with a party of Tighnari and one other member
const startBurst = (constellationCount: number): KitBuff[] => {
  const kitEffectState: KitEffectState = { effects: [] };
  const combatant = { ...createTighnariCombatant(0, 0), constellationCount };
  TIGHNARI_KIT.elementalBurst.onStart?.(
    createKitTestContext(combatant, {
      kitEffectState,
      party: createParty([TIGHNARI_CHARACTER_ID, OTHER_CHARACTER_ID]),
    }),
  );
  return kitEffectState.effects.filter((effect): effect is KitBuff => effect.kind === "buff");
};

describe(createTighnariKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...TIGHNARI_KIT.normalAttacks.flatMap((action) => action.hits.map(({ talentMultiplier }) => talentMultiplier)),
      takeOne(TIGHNARI_KIT.chargedAttack.hits).talentMultiplier,
      TIGHNARI_KIT.plungeCollision.talentMultiplier,
      takeOne(TIGHNARI_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(TIGHNARI_KIT.highPlunge.hits).talentMultiplier,
      takeOne(TIGHNARI_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(TIGHNARI_KIT.elementalBurst.hits).talentMultiplier,
    ];

    expect(multipliers).toStrictEqual([
      0.44634, 0.41968, 0.26445, 0.26445, 0.68628, 1.24, 0.568288, 1.136335, 1.419344, 1.496, 0.5562,
    ]);
  });

  test("the skill and burst cooldowns and the burst's energy cost come from the table", () => {
    expect.hasAssertions();

    expect(TIGHNARI_KIT.skillCooldownSeconds).toBe(12);
    expect(TIGHNARI_KIT.burstCooldownSeconds).toBe(12);
    expect(TIGHNARI_KIT.burstEnergyCost).toBe(40);
  });

  test("the fully charged arrow lands at 96 frames, 10 after its 86-frame hitmark and past the 94-frame animation", () => {
    expect.hasAssertions();

    expect(Math.round(takeOne(TIGHNARI_KIT.chargedAttack.hits).hitmarkSeconds * 60)).toBe(96);
    expect(Math.round(TIGHNARI_KIT.chargedAttack.seconds * 60)).toBe(94);
  });

  test("the Tanglevine Shaft hits land from 112 frames, and its secondary's six from 147", () => {
    expect.hasAssertions();
    const hitmarks = TIGHNARI_KIT.elementalBurst.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60));

    expect(hitmarks).toStrictEqual([112, 117, 120, 121, 126, 128, 147, 153, 160, 161, 171, 175]);
  });

  test("the Vijnana-Phala Mine hits 20 frames after it is cast", () => {
    expect.hasAssertions();

    expect(Math.round(takeOne(TIGHNARI_KIT.elementalSkill.hits).hitmarkSeconds * 60)).toBe(20);
  });

  // Ascension 4's damage bonus
  const kitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const party = createParty([TIGHNARI_CHARACTER_ID]);
  const getDamageBonus = (combatant: Combatant, attackTag: AttackTag): number =>
    TIGHNARI_KIT.getStrikeDamageBonus?.(
      { attackTag, body: kitBody, combatant, hit: takeOne(TIGHNARI_KIT.chargedAttack.hits) },
      enemy,
      party,
    ) ?? 0;

  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();
    const combatant = createTighnariCombatant(4, 2000);

    expect([
      getDamageBonus(combatant, AttackTag.ChargedAttack),
      getDamageBonus(combatant, AttackTag.ElementalBurst),
      getDamageBonus(combatant, AttackTag.NormalAttack),
    ]).toStrictEqual([0.6, 0.6, 0]);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect([
      getDamageBonus(createTighnariCombatant(3, 2000), AttackTag.ChargedAttack),
      getDamageBonus(createTighnariCombatant(3, 2000), AttackTag.ElementalBurst),
    ]).toStrictEqual([0, 0]);
  });

  test("the bonus is 0.06% for each point of Elemental Mastery", () => {
    expect.hasAssertions();

    expect(getDamageBonus(createTighnariCombatant(4, 500), AttackTag.ChargedAttack)).toBeCloseTo(0.3);
  });
  describe("constellation 1's CRIT Rate", () => {
    const strikeBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };
    const strikeEnemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const getCriticalRateBonus = (constellationCount: number, attackTag: AttackTag): number =>
      TIGHNARI_KIT.getStrikeCriticalRateBonus?.(
        {
          attackTag,
          body: strikeBody,
          combatant: { ...createTighnariCombatant(0, 0), constellationCount },
          hit: takeOne(TIGHNARI_KIT.chargedAttack.hits),
        },
        strikeEnemy,
        createParty([TIGHNARI_CHARACTER_ID]),
        [],
      ) ?? 0;

    test("a Constellation 1 switch raises the CRIT Rate of his charged attacks by 15%", () => {
      expect.hasAssertions();

      expect(getCriticalRateBonus(1, AttackTag.ChargedAttack)).toBe(0.15);
    });

    test("a Constellation 0 switch, or a normal attack at Constellation 1, changes no CRIT Rate", () => {
      expect.hasAssertions();

      expect([
        getCriticalRateBonus(0, AttackTag.ChargedAttack),
        getCriticalRateBonus(1, AttackTag.NormalAttack),
      ]).toStrictEqual([0, 0]);
    });
  });
  describe("constellation 4's team Elemental Mastery", () => {
    test("a Constellation 4 switch gives every member 60 Elemental Mastery for 8 seconds as the burst starts", () => {
      expect.hasAssertions();

      expect(
        startBurst(4).map(({ amount, attribute, characterId, secondsRemaining }) => ({
          amount,
          attribute,
          characterId,
          secondsRemaining,
        })),
      ).toStrictEqual([
        { amount: 60, attribute: Attribute.ElementalMastery, characterId: TIGHNARI_CHARACTER_ID, secondsRemaining: 8 },
        { amount: 60, attribute: Attribute.ElementalMastery, characterId: OTHER_CHARACTER_ID, secondsRemaining: 8 },
      ]);
    });

    test("a Constellation 3 switch gives no Elemental Mastery as the burst starts", () => {
      expect.hasAssertions();

      expect(startBurst(3)).toStrictEqual([]);
    });
  });
});
