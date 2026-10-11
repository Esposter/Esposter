import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitShield } from "#src/models/kit/KitShield";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { BAIZHU_CHARACTER_ID, createBaizhuKit } from "#src/services/kit/characters/baizhuKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const BAIZHU_KIT = createBaizhuKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [BAIZHU_CHARACTER_ID]));
const MAX_HEALTH = 10_000;
const kitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };

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

// The effects an action's start adds to the team's, which its owner holds
const castAction = (action: KitAction): KitEffectState => {
  const kitEffectState: KitEffectState = { effects: [] };
  action.onStart?.({
    body: kitBody,
    combatant: createBaizhuCombatant(),
    kitEffectState,
    party: createParty([BAIZHU_CHARACTER_ID]),
  });
  return kitEffectState;
};

describe(createBaizhuKit, () => {
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
