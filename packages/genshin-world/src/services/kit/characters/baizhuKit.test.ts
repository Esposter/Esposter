import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitShield } from "#src/models/kit/KitShield";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { BAIZHU_CHARACTER_ID, createBaizhuKitBehaviour } from "#src/services/kit/characters/baizhuKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const BAIZHU_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, BAIZHU_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
// A member on the field beside Baizhu
const ACTIVE_CHARACTER_ID = 10_000_050;
// The DMG Bonus Baizhu's first strike, a Dendro hit, takes from Baizhu at the ascension while the character on the field
// Stands at the share of their HP
const getDendroStrikeDamageBonus = (ascension: number, activeHealthShare: number): number | undefined => {
  const combatant: Combatant = {
    ascension,
    attributes: computeCharacterAttributes([]),
    characterId: BAIZHU_CHARACTER_ID,
    constellationCount: 0,
    element: Element.Dendro,
    elementalResonances: [],
    kit: BAIZHU_KIT,
    level: 90,
    weaponType: WeaponType.Catalyst,
  };
  const party = createParty([ACTIVE_CHARACTER_ID, BAIZHU_CHARACTER_ID]);
  getPartyMember(party, ACTIVE_CHARACTER_ID).healthShare = activeHealthShare;
  const hit = takeOne(takeOne(BAIZHU_KIT.normalAttacks).hits);
  return BAIZHU_KIT.getStrikeDamageBonus?.(
    { body: createKitTestContext(combatant).body, combatant, hit },
    createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
    party,
  );
};

describe(createBaizhuKitBehaviour, () => {
  // The effects an action's start adds to the team's, which its owner holds
  const castAction = (action: KitAction): KitEffectState => {
    const kitEffectState: KitEffectState = { effects: [] };
    action.onStart?.(createKitTestContext(createBaizhuCombatant(), { kitEffectState }));
    return kitEffectState;
  };

  const createBaizhuCombatant = (): Combatant => ({
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: MAX_HEALTH }]),
    characterId: BAIZHU_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: BAIZHU_KIT,
    level: 90,
    weaponType: WeaponType.Catalyst,
  });

  const MAX_HEALTH = 10_000;

  test("reads the strikes', charged attack's, plunges' and skill's multipliers from his proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...BAIZHU_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      BAIZHU_KIT.chargedAttack.hits[0]?.talentMultiplier,
      BAIZHU_KIT.plungeCollision.talentMultiplier,
      BAIZHU_KIT.lowPlunge.hits[0]?.talentMultiplier,
      BAIZHU_KIT.highPlunge.hits[0]?.talentMultiplier,
      BAIZHU_KIT.elementalSkill.hits[0]?.talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([
      0.373704, 0.364248, 0.225416, 0.225416, 0.541376, 1.2104, 0.568288, 1.136335, 1.419344, 0.792,
    ]);
  });

  test("the charged attack costs 50 stamina, his burst costs 80 energy and cools for 20 seconds, and his skill cools for 10 seconds", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: BAIZHU_KIT.burstCooldownSeconds,
      burstEnergyCost: BAIZHU_KIT.burstEnergyCost,
      chargedAttackStamina: BAIZHU_KIT.chargedAttackStamina,
      skillCooldownSeconds: BAIZHU_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 20,
      burstEnergyCost: 80,
      chargedAttackStamina: 50,
      skillCooldownSeconds: 10,
    });
  });

  test("holistic revivification sets a seamless shield at the cast that lasts to its first expiry, which explodes as Spiritvein", () => {
    expect.hasAssertions();
    const kitEffectState = castAction(BAIZHU_KIT.elementalBurst);
    const shield = kitEffectState.effects.find((effect): effect is KitShield => effect.kind === "shield");
    expect({
      explosionHitMultiplier: shield?.explosion?.hit.talentMultiplier,
      secondsRemaining: shield?.secondsRemaining,
    }).toStrictEqual({ explosionHitMultiplier: 0.97064, secondsRemaining: 233 / 60 });
  });

  test("the seamless shield's damage absorption is his share of Max HP plus its flat amount", () => {
    expect.hasAssertions();
    const shield = castAction(BAIZHU_KIT.elementalBurst).effects.find(
      (effect): effect is KitShield => effect.kind === "shield",
    );
    expect(shield?.health).toBeCloseTo(0.008 * MAX_HEALTH + 77.03752, 6);
  });
});

describe("five Fortunes Forever", () => {
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(getDendroStrikeDamageBonus(1, 0.5)).toBe(0.25);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(getDendroStrikeDamageBonus(0, 1)).toBe(0);
  });

  test("the Dendro DMG Bonus waits while the character on the field is below half HP", () => {
    expect.hasAssertions();

    expect(getDendroStrikeDamageBonus(1, 0.49)).toBe(0);
  });
});
