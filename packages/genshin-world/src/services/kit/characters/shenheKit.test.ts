import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createShenheKit, SHENHE_CHARACTER_ID } from "#src/services/kit/characters/shenheKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const SHENHE_KIT = createShenheKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [SHENHE_CHARACTER_ID]));

const createShenheCombatant = (ascension = 0): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: SHENHE_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: SHENHE_KIT,
  level: 90,
  weaponType: WeaponType.Polearm,
});

describe(createShenheKit, () => {
  const kitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };
  const castField = (ascension: number): KitField => {
    const kitEffectState: KitEffectState = { effects: [] };
    const combatant = createShenheCombatant(ascension);
    SHENHE_KIT.elementalBurst.onStart?.({
      body: kitBody,
      combatant,
      kitEffectState,
      party: createParty([SHENHE_CHARACTER_ID]),
    });
    return takeOne(kitEffectState.effects.filter((effect): effect is KitField => effect.kind === "field"));
  };
  // The effects a field's tick adds, from a field cast by a combatant of the given ascension
  const tickField = (ascension: number, tickIndex: number): KitEffect[] => {
    const kitEffectState: KitEffectState = { effects: [] };
    castField(ascension).onTick({
      activeCombatant: createShenheCombatant(),
      characterIdCombatantMap: new Map([[SHENHE_CHARACTER_ID, createShenheCombatant()]]),
      enemyMap: new Map(),
      kitEffectState,
      party: createParty([SHENHE_CHARACTER_ID]),
      tickIndex,
    });
    return kitEffectState.effects;
  };

  const tickSummon = (tickIndex: number): KitSummon | undefined =>
    tickField(0, tickIndex).find((effect): effect is KitSummon => effect.kind === "summon");

  test("reads each talent multiplier from her proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...SHENHE_KIT.normalAttacks.flatMap((action) => action.hits.map((hit) => hit.talentMultiplier)),
      takeOne(SHENHE_KIT.chargedAttack.hits).talentMultiplier,
      SHENHE_KIT.plungeCollision.talentMultiplier,
      takeOne(SHENHE_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(SHENHE_KIT.highPlunge.hits).talentMultiplier,
      takeOne(SHENHE_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(SHENHE_KIT.elementalBurst.hits).talentMultiplier,
    ];
    const expectedMultipliers = [
      0.43258, 0.40248, 0.5332, 0.26316, 0.26316, 0.65618, 1.106734, 0.639324, 1.278377, 1.596762, 1.392, 1.008,
    ];
    expect(multipliers).toStrictEqual(expectedMultipliers);
  });

  test("the press lands at 4 frames and the hold at 33, each holding its own cooldown", () => {
    expect.hasAssertions();
    const hold = takeOne(SHENHE_KIT.elementalSkillHolds ?? []);

    expect(Math.round(takeOne(SHENHE_KIT.elementalSkill.hits).hitmarkSeconds * 60)).toBe(4);
    expect(Math.round(takeOne(hold.action.hits).hitmarkSeconds * 60)).toBe(33);
    expect([SHENHE_KIT.skillCooldownSeconds, hold.cooldownSeconds]).toStrictEqual([10, 15]);
  });

  test("the charged attack costs her table's 25 stamina, and the burst her table's 80 energy", () => {
    expect.hasAssertions();
    expect([
      SHENHE_KIT.chargedAttackStamina,
      SHENHE_KIT.burstEnergyCost,
      SHENHE_KIT.burstCooldownSeconds,
    ]).toStrictEqual([25, 80, 20]);
  });

  test("divine Maiden's Deliverance's field ticks from 82 frames, every 117, and its DoT's second hit follows its tick's offset", () => {
    expect.hasAssertions();
    const field = castField(0);

    expect(field.nextTickSeconds).toBeCloseTo(82 / 60);
    expect(field.tickIntervalSeconds).toBeCloseTo(117 / 60);
    expect(field.radius).toBe(7);
    expect(tickSummon(1)?.hits.map((hit) => Math.round(hit.hitmarkSeconds * 60))).toStrictEqual([0, 32]);
  });

  test("the field's Cryo DMG Bonus comes from Ascension 1, for the active character", () => {
    expect.hasAssertions();
    expect(tickField(0, 0).filter((effect) => effect.kind === "buff")).toStrictEqual([]);
    expect(tickField(1, 0).filter((effect) => effect.kind === "buff")).toStrictEqual([
      {
        amount: 0.15,
        attribute: Attribute.CryoDamageBonus,
        characterId: SHENHE_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 117 / 60,
        source: "shenhe-burst-cryo",
      },
    ]);
  });
});
