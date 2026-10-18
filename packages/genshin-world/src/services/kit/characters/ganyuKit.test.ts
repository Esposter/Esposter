import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitSummon } from "#src/models/kit/KitSummon";
import type { KitTaunt } from "#src/models/kit/KitTaunt";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createGanyuKitBehaviour, GANYU_CHARACTER_ID } from "#src/services/kit/characters/ganyuKit";
import { castKitAction, createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const GANYU_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, GANYU_CHARACTER_ID);
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

// The buffs a field's tick gives the active character, from the field its caster of the given ascension cast
const getTickBuffs = (ascension: number): KitEffect[] => {
  const field = castKitAction(GANYU_KIT.elementalBurst, createGanyuCombatant(ascension)).effects.find(
    (effect): effect is KitField => effect.kind === "field",
  );
  const kitEffectState: KitEffectState = { effects: [] };
  field?.onTick(
    createKitTestContext(createGanyuCombatant(), { characterIdCombatantMap: new Map(), kitEffectState }),
    0,
  );
  return kitEffectState.effects.filter((effect) => effect.kind === "buff");
};

describe(createGanyuKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...GANYU_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      ...GANYU_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
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
    expect(GANYU_KIT.chargedAttack.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60))).toStrictEqual([
      113, 131,
    ]);
    expect(Math.round(GANYU_KIT.chargedAttack.seconds * 60)).toBe(113);
  });

  test("the Ascension 1 passive, Undivided Heart, takes effect at its ascension phase", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    const hit = takeOne(GANYU_KIT.chargedAttack.hits);
    const combatant = createGanyuCombatant(1);
    const context = createKitTestContext(combatant, { kitEffectState });
    hit.onStrike?.(
      context,
      { body: context.body, combatant, hit },
      createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
    );

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

  test("the Ascension 1 passive, Undivided Heart, does not take effect below its ascension phase", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    const hit = takeOne(GANYU_KIT.chargedAttack.hits);
    const combatant = createGanyuCombatant(0);
    const context = createKitTestContext(combatant, { kitEffectState });
    hit.onStrike?.(
      context,
      { body: context.body, combatant, hit },
      createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
    );

    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test("the Ice Lotus explodes 373 frames after it is cast, when its taunt runs out", () => {
    expect.hasAssertions();
    const taunt = castKitAction(GANYU_KIT.elementalSkill, createGanyuCombatant()).effects.find(
      (effect): effect is KitTaunt => effect.kind === "taunt",
    );

    expect(taunt?.secondsRemaining).toBeCloseTo(373 / 60);
    expect(taunt?.explosion?.hitmarkSeconds).toBe(0);
  });

  test("the Celestial Shower's field ticks every 18 frames, and each tick's hit lands 8 frames after it", () => {
    expect.hasAssertions();
    const field = castKitAction(GANYU_KIT.elementalBurst, createGanyuCombatant()).effects.find(
      (effect): effect is KitField => effect.kind === "field",
    );
    const kitEffectState: KitEffectState = { effects: [] };
    field?.onTick(
      createKitTestContext(createGanyuCombatant(), { characterIdCombatantMap: new Map(), kitEffectState }),
      0,
    );

    expect(field?.tickIntervalSeconds).toBeCloseTo(18 / 60);
    expect(field?.radius).toBe(10);
    const tickSummon = kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");

    expect(tickSummon?.hits[0]?.hitmarkSeconds).toBeCloseTo(8 / 60);
  });

  test("the Ascension 4 passive, Harmony between Heaven and Earth, takes effect at its ascension phase", () => {
    expect.hasAssertions();

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

  test("the Ascension 4 passive, Harmony between Heaven and Earth, does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(getTickBuffs(3)).toStrictEqual([]);
  });

  test("each Celestial Shower tick's hit lands from where it was cast, whatever the body does after", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createGanyuCombatant());
    GANYU_KIT.elementalBurst.onStart?.(context);
    const field = context.kitEffectState.effects.find((effect): effect is KitField => effect.kind === "field");
    context.body.position.x = 1;
    field?.onTick(context, 0);
    const tickSummon = context.kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");

    expect(tickSummon?.body.position).toStrictEqual({ x: 0, z: 0 });
  });

  test("an active constellation's switch changes its character's kit", () => {
    expect.hasAssertions();

    expect(GANYU_KIT.getSkillChargeBonus?.(createGanyuCombatant(0, 2))).toBe(1);
  });

  test("an inactive constellation changes nothing", () => {
    expect.hasAssertions();

    expect(GANYU_KIT.getSkillChargeBonus?.(createGanyuCombatant(0, 1))).toBe(0);
  });
});
