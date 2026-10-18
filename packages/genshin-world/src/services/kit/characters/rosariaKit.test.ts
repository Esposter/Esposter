import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createRosariaKitBehaviour, ROSARIA_CHARACTER_ID } from "#src/services/kit/characters/rosariaKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const ROSARIA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, ROSARIA_CHARACTER_ID);
const TEAMMATE_CHARACTER_ID = 90_001;
const createRosariaCombatant = (constellationCount: number, ascension = 0, criticalRate = 0): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([
    { attribute: Attribute.BaseHealth, value: 10_000 },
    { attribute: Attribute.CriticalRate, value: criticalRate },
  ]),
  characterId: ROSARIA_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: ROSARIA_KIT,
  level: 90,
  weaponType: WeaponType.Polearm,
});

const getFieldSeconds = (constellationCount: number): number => {
  const kitEffectState: KitEffectState = { effects: [] };
  ROSARIA_KIT.elementalBurst.onStart?.(
    createKitTestContext(createRosariaCombatant(constellationCount), { kitEffectState }),
  );
  const field = kitEffectState.effects.find((effect): effect is KitField => effect.kind === "field");
  if (!field) throw new Error("Rites of Termination placed no field");
  return field.secondsRemaining;
};

// The buffs on the team once Ravaging Confession's first hit, cast by Rosaria at the ascension, strikes an enemy
const strikeFirstSkillHit = (ascension: number) => {
  const combatant = createRosariaCombatant(0, ascension);
  const context = createKitTestContext(combatant);
  ROSARIA_KIT.elementalSkill.onStart?.(context);
  const hit = takeOne(ROSARIA_KIT.elementalSkill.hits);
  hit.onStrike?.(context, { body: context.body, combatant, hit });
  return context.kitEffectState.effects.filter((effect) => effect.kind === "buff");
};

describe(createRosariaKitBehaviour, () => {
  test("the field Rites of Termination places lasts four seconds longer from Constellation 2", () => {
    expect.hasAssertions();
    expect(getFieldSeconds(2) - getFieldSeconds(0)).toBe(4);
  });

  test("each tick of Rites of Termination lands from where the lance was cast, whatever the body does after", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createRosariaCombatant(0));
    ROSARIA_KIT.elementalBurst.onStart?.(context);
    const field = context.kitEffectState.effects.find((effect): effect is KitField => effect.kind === "field");
    context.body.position.x = 1;
    field?.onTick(context, 0);
    const tickSummon = context.kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");

    expect(tickSummon?.body.position).toStrictEqual({ x: 0, z: 0 });
  });

  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();
    // Ascension 4: the cast gives each other member of the team 15% of Rosaria's Crit Rate (0.15 * 0.4 = 0.06) for 10 seconds
    const context = createKitTestContext(createRosariaCombatant(0, 4, 0.4), {
      party: createParty([ROSARIA_CHARACTER_ID, TEAMMATE_CHARACTER_ID]),
    });
    ROSARIA_KIT.elementalBurst.onStart?.(context);

    expect(context.kitEffectState.effects.filter((effect) => effect.kind === "buff")).toStrictEqual([
      {
        amount: 0.06,
        attribute: Attribute.CriticalRate,
        characterId: TEAMMATE_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 10,
      },
    ]);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createRosariaCombatant(0, 3, 0.4), {
      party: createParty([ROSARIA_CHARACTER_ID, TEAMMATE_CHARACTER_ID]),
    });
    ROSARIA_KIT.elementalBurst.onStart?.(context);

    expect(context.kitEffectState.effects.filter((effect) => effect.kind === "buff")).toStrictEqual([]);
  });
});

describe("regina Probationum", () => {
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(strikeFirstSkillHit(1)).toStrictEqual([
      {
        amount: 0.12,
        attribute: Attribute.CriticalRate,
        characterId: ROSARIA_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 5,
        source: "rosaria-regina-probationum",
      },
    ]);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(strikeFirstSkillHit(0)).toStrictEqual([]);
  });
});
