import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitHit } from "#src/models/kit/KitHit";

import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { LISA_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { createLisaKit } from "#src/services/kit/characters/lisaKit";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readKitStackedHit } from "#src/services/kit/readKitStackedHit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { strikeEnemy } from "#src/services/kit/strikeEnemy";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const LISA_KIT = createLisaKit(await readTalentMultipliers([LISA_CHARACTER_ID]));

const createLisaCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: LISA_CHARACTER_ID,
  elementalResonances: [],
  kit: LISA_KIT,
  level: 90,
});

describe("lisa kit", () => {
  test("reads each talent multiplier from its proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...LISA_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      takeOne(LISA_KIT.chargedAttack.hits).talentMultiplier,
      LISA_KIT.plungeCollision.talentMultiplier,
      takeOne(LISA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(LISA_KIT.highPlunge.hits).talentMultiplier,
      takeOne(LISA_KIT.elementalSkill.hits).talentMultiplier,
    ];
    const expectedMultipliers = [0.396, 0.3592, 0.428, 0.5496, 1.7712, 0.5683, 1.1363, 1.4193, 0.8];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test("its Lightning Rose discharges thirty times for 15 seconds from its first, then ends", () => {
    expect.hasAssertions();
    const combatant = createLisaCombatant();
    const party = createParty([LISA_CHARACTER_ID]);
    const body = { x: 0, z: 0 };
    const effects: KitEffect[] = [];
    LISA_KIT.elementalBurst.onStart?.({ body: { facing: 0, height: 0, position: body }, combatant, effects });

    const discharges = stepKitEffects(effects, 17, { activeCombatant: combatant, body, party });
    expect(discharges).toHaveLength(30);
    expect(discharges.every(({ hit }) => hit.talentMultiplier === 0.3656)).toBe(true);
    expect(effects).toStrictEqual([]);
  });

  test("stacks Conductive on each enemy its press strikes, up to three", () => {
    expect.hasAssertions();
    const enemy = { ...createEnemy(ENEMY_CAMP_MEMBER, ""), health: 1e9, maxHealth: 1e9 };
    const press = takeOne(LISA_KIT.elementalSkill.hits);

    for (let strike = 0; strike < 4; strike++) strikeEnemy(enemy, press, createLisaCombatant(), () => 1);

    expect(enemy.statuses.map(({ id, stacks }) => [id, stacks])).toStrictEqual([["conductive", 3]]);
  });

  test("its hold strikes an enemy at the multiplier of its Conductive stacks, and consumes them", () => {
    expect.hasAssertions();
    const hold = LISA_KIT.elementalSkillHolds?.[0]?.action;
    const hit = takeOne(hold?.hits ?? []) satisfies KitHit;
    const enemy = createEnemy(ENEMY_CAMP_MEMBER, "");
    enemy.statuses = [{ damageTakenBonus: 0, id: "conductive", secondsRemaining: Infinity, stacks: 2 }];

    const read = readKitStackedHit(enemy, hit);

    expect(read.talentMultiplier).toBeCloseTo(4.24, 2);
    expect(read.poiseDamage).toBe(240);
    expect(enemy.statuses).toStrictEqual([]);
  });
});
