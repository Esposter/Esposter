import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitShield } from "#src/models/kit/KitShield";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createDahliaKit, DAHLIA_CHARACTER_ID } from "#src/services/kit/characters/dahliaKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const DAHLIA_KIT = createDahliaKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [DAHLIA_CHARACTER_ID]));

const createDahliaCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseDefense, value: 1000 }]),
  characterId: DAHLIA_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: DAHLIA_KIT,
  level: 90,
  weaponType: WeaponType.Sword,
});

describe(createDahliaKit, () => {
  const kitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };

  test("reads each talent multiplier from her proud skill groups, to four decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...DAHLIA_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      ...DAHLIA_KIT.chargedAttack.hits.map((hit) => hit.talentMultiplier),
      DAHLIA_KIT.plungeCollision.talentMultiplier,
      takeOne(DAHLIA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(DAHLIA_KIT.highPlunge.hits).talentMultiplier,
      takeOne(DAHLIA_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(DAHLIA_KIT.elementalBurst.hits).talentMultiplier,
    ].map((multiplier) => Number(multiplier.toFixed(4)));

    expect(multipliers).toStrictEqual([
      0.4355, 0.401, 0.2374, 0.6566, 0.3988, 0.5507, 0.6393, 1.2784, 1.5968, 2.328, 4.064,
    ]);
  });

  test("reads her stamina, her cooldowns and her burst's energy cost from her proud skill groups", () => {
    expect.hasAssertions();
    expect([
      DAHLIA_KIT.chargedAttackStamina,
      DAHLIA_KIT.skillCooldownSeconds,
      DAHLIA_KIT.burstCooldownSeconds,
      DAHLIA_KIT.burstEnergyCost,
    ]).toStrictEqual([20, 9, 15, 60]);
  });

  test("lands her strikes at their hitmarks, her charged attack at 10 frames, her skill's tap at 27 and hold at 28, and her burst at 30", () => {
    expect.hasAssertions();
    expect({
      burstHitmarkFrames: DAHLIA_KIT.elementalBurst.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
      chargedAttackHitmarkFrames: DAHLIA_KIT.chargedAttack.hits.map(({ hitmarkSeconds }) =>
        Math.round(hitmarkSeconds * 60),
      ),
      normalAttackHitmarkFrames: DAHLIA_KIT.normalAttacks.map(({ hits }) =>
        Math.round(takeOne(hits).hitmarkSeconds * 60),
      ),
      skillHitmarkFrames: DAHLIA_KIT.elementalSkill.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
      skillHoldHitmarkFrames: takeOne(DAHLIA_KIT.elementalSkillHolds ?? []).action.hits.map(({ hitmarkSeconds }) =>
        Math.round(hitmarkSeconds * 60),
      ),
    }).toStrictEqual({
      burstHitmarkFrames: [30],
      chargedAttackHitmarkFrames: [10, 10],
      normalAttackHitmarkFrames: [15, 13, 14, 21],
      skillHitmarkFrames: [27],
      skillHoldHitmarkFrames: [28],
    });
  });

  test("her burst places a shield 31 frames in, priced by her Max HP and the table's flat HP, for the seconds its Favonian Favor holds", () => {
    expect.hasAssertions();
    const combatant = createDahliaCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    DAHLIA_KIT.elementalBurst.onStart?.({
      body: kitBody,
      combatant,
      kitEffectState,
      party: createParty([DAHLIA_CHARACTER_ID]),
      random: () => 0,
    });
    const field = takeOne(kitEffectState.effects.filter((effect): effect is KitField => effect.kind === "field"));
    expect(field.nextTickSeconds).toBeCloseTo(31 / 60);

    field.onTick({
      activeCombatant: combatant,
      characterIdCombatantMap: new Map([[DAHLIA_CHARACTER_ID, combatant]]),
      enemyMap: new Map(),
      kitEffectState,
      party: createParty([DAHLIA_CHARACTER_ID]),
      tickIndex: 0,
    });
    const shield = takeOne(kitEffectState.effects.filter((effect): effect is KitShield => effect.kind === "shield"));
    expect(shield.health).toBeCloseTo(0.0336 * combatant.attributes.maxHealth + 323.5577);
    expect(shield.secondsRemaining).toBe(12);
  });
});
