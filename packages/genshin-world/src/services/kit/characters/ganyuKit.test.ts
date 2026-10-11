import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitSummon } from "#src/models/kit/KitSummon";
import type { KitTaunt } from "#src/models/kit/KitTaunt";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { GANYU_CHARACTER_ID } from "#src/services/character/constants";
import { createGanyuKit } from "#src/services/kit/characters/ganyuKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const GANYU_KIT = createGanyuKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [GANYU_CHARACTER_ID]));

const createGanyuCombatant = (ascension = 0, constellationCount = 0): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: GANYU_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: GANYU_KIT,
  level: 90,
  weaponType: WeaponType.Bow,
});

describe(createGanyuKit, () => {
  const kitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };
  // The effects an action's start adds, as the kit's effects hold them
  const castEffects = (action: KitAction, combatant = createGanyuCombatant()): KitEffect[] => {
    const kitEffectState: KitEffectState = { effects: [] };
    action.onStart?.({ body: kitBody, combatant, kitEffectState, party: createParty([GANYU_CHARACTER_ID]) });
    return kitEffectState.effects;
  };
  const castSummon = (action: KitAction): KitSummon | undefined =>
    castEffects(action).find((effect): effect is KitSummon => effect.kind === "summon");

  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...GANYU_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      takeOne(GANYU_KIT.chargedAttack.hits).talentMultiplier,
      takeOne(castSummon(GANYU_KIT.chargedAttack)?.hits ?? []).talentMultiplier,
      GANYU_KIT.plungeCollision.talentMultiplier,
      takeOne(GANYU_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(GANYU_KIT.highPlunge.hits).talentMultiplier,
      takeOne(GANYU_KIT.elementalSkill.hits).talentMultiplier,
    ];
    const expectedMultipliers = [
      0.31734, 0.35604, 0.45494, 0.45494, 0.48246, 0.5762, 1.28, 2.176, 0.568288, 1.136335, 1.419344, 1.2,
    ];
    expect(multipliers).toStrictEqual(expectedMultipliers);
  });

  test("the fully charged Frostflake Arrow lands at 113 frames and its Bloom 18 frames after the arrow's travel", () => {
    expect.hasAssertions();
    const arrowHitmark = Math.round(takeOne(GANYU_KIT.chargedAttack.hits).hitmarkSeconds * 60);
    const bloomHitmark = Math.round(takeOne(castSummon(GANYU_KIT.chargedAttack)?.hits ?? []).hitmarkSeconds * 60);

    expect(arrowHitmark).toBe(113);
    expect(bloomHitmark).toBe(131);
  });

  test("the arrows after the first get Undivided Heart's CRIT Rate, from Ascension 1", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    const strike = (ascension: number): void =>
      takeOne(GANYU_KIT.chargedAttack.hits).onStrike?.({
        body: kitBody,
        combatant: createGanyuCombatant(ascension),
        kitEffectState,
        party: createParty([GANYU_CHARACTER_ID]),
      });

    strike(0);
    expect(kitEffectState.effects).toStrictEqual([]);
    strike(1);
    expect(kitEffectState.effects).toStrictEqual([
      {
        amount: 0.2,
        attribute: Attribute.CriticalRate,
        characterId: GANYU_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 5,
        source: "ganyu-undivided-heart",
      },
    ]);
  });

  test("the Ice Lotus explodes 373 frames after it is cast, when its taunt runs out", () => {
    expect.hasAssertions();
    const taunt = castEffects(GANYU_KIT.elementalSkill).find((effect): effect is KitTaunt => effect.kind === "taunt");

    expect(taunt?.secondsRemaining).toBeCloseTo(373 / 60);
    expect(taunt?.explosion.hitmarkSeconds).toBe(0);
  });

  test("the Celestial Shower's field ticks every 18 frames, and each tick's hit lands 8 frames after it", () => {
    expect.hasAssertions();
    const field = castEffects(GANYU_KIT.elementalBurst).find((effect): effect is KitField => effect.kind === "field");
    const kitEffectState: KitEffectState = { effects: [] };
    field?.onTick({
      characterIdCombatantMap: new Map(),
      characterIdCombatantMap: new Map(),
      activeCombatant: createGanyuCombatant(),
      enemyMap: new Map(),
      kitEffectState,
      party: createParty([GANYU_CHARACTER_ID]),
      tickIndex: 0,
    });

    expect(field?.tickIntervalSeconds).toBeCloseTo(18 / 60);
    expect(field?.radius).toBe(10);
    const tickSummon = kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");

    expect(tickSummon?.hits[0]?.hitmarkSeconds).toBeCloseTo(8 / 60);
  });

  // The buffs a field's tick gives the active character, from the field its caster of the given ascension cast
  const getTickBuffs = (ascension: number): KitEffect[] => {
    const field = castEffects(GANYU_KIT.elementalBurst, createGanyuCombatant(ascension)).find(
      (effect): effect is KitField => effect.kind === "field",
    );
    const kitEffectState: KitEffectState = { effects: [] };
    field?.onTick({
      characterIdCombatantMap: new Map(),
      characterIdCombatantMap: new Map(),
      activeCombatant: createGanyuCombatant(),
      enemyMap: new Map(),
      kitEffectState,
      party: createParty([GANYU_CHARACTER_ID]),
      tickIndex: 0,
    });
    return kitEffectState.effects.filter((effect) => effect.kind === "buff");
  };

  test("the Harmony between Heaven and Earth gives the active character 20% Cryo DMG Bonus from Ascension 4", () => {
    expect.hasAssertions();
    expect(getTickBuffs(3)).toStrictEqual([]);
    expect(getTickBuffs(4)).toStrictEqual([
      {
        amount: 0.2,
        attribute: Attribute.CryoDamageBonus,
        characterId: GANYU_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 1,
        source: "ganyu-harmony",
      },
    ]);
  });
});
