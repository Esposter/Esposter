import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createXianyunKitBehaviour, XIANYUN_CHARACTER_ID } from "#src/services/kit/characters/xianyunKit";
import { castKitAction, createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const XIANYUN_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, XIANYUN_CHARACTER_ID);
const createXianyunCombatant = (constellationCount: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: XIANYUN_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: XIANYUN_KIT,
  level: 90,
});

describe(createXianyunKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...XIANYUN_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      takeOne(XIANYUN_KIT.chargedAttack.hits).talentMultiplier,
      XIANYUN_KIT.plungeCollision.talentMultiplier,
      takeOne(XIANYUN_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(XIANYUN_KIT.highPlunge.hits).talentMultiplier,
      takeOne(XIANYUN_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(XIANYUN_KIT.elementalBurst.hits).talentMultiplier,
    ];
    const expectedMultipliers = [
      0.403024, 0.388552, 0.488776, 0.649168, 1.2312, 0.568288, 1.136335, 1.419344, 0.248, 1.08,
    ];
    expect(multipliers).toStrictEqual(expectedMultipliers);
  });

  test("each strike lands its hitmark's frames plus gcsim's travel, and animates for its own frames", () => {
    expect.hasAssertions();
    const landings = XIANYUN_KIT.normalAttacks.map((action) => Math.round(takeOne(action.hits).hitmarkSeconds * 60));
    const animations = XIANYUN_KIT.normalAttacks.map((action) => Math.round(action.seconds * 60));

    expect(landings).toStrictEqual([22, 24, 44, 48]);
    expect(animations).toStrictEqual([34, 38, 65, 93]);
  });

  test("the charged attack lands at 66 frames and animates for 73", () => {
    expect.hasAssertions();
    const landing = Math.round(takeOne(XIANYUN_KIT.chargedAttack.hits).hitmarkSeconds * 60);

    expect(landing).toBe(66);
    expect(Math.round(XIANYUN_KIT.chargedAttack.seconds * 60)).toBe(73);
  });

  test("the plunges land at their hitmarks, the low at 44 frames and the high at 46", () => {
    expect.hasAssertions();
    const lowLanding = Math.round(takeOne(XIANYUN_KIT.lowPlunge.hits).hitmarkSeconds * 60);
    const highLanding = Math.round(takeOne(XIANYUN_KIT.highPlunge.hits).hitmarkSeconds * 60);

    expect(lowLanding).toBe(44);
    expect(highLanding).toBe(46);
    expect(Math.round(XIANYUN_KIT.lowPlunge.seconds * 60)).toBe(65);
    expect(Math.round(XIANYUN_KIT.highPlunge.seconds * 60)).toBe(68);
  });

  test("skyladder's press lands at 3 frames, and its cooldown is 12 seconds", () => {
    expect.hasAssertions();
    const pressLanding = Math.round(takeOne(XIANYUN_KIT.elementalSkill.hits).hitmarkSeconds * 60);

    expect(pressLanding).toBe(3);
    expect(XIANYUN_KIT.skillCooldownSeconds).toBe(12);
  });

  test("stars Gather at Dusk lands at 75 frames, costs 70 energy and cools down for 18 seconds", () => {
    expect.hasAssertions();
    const burstLanding = Math.round(takeOne(XIANYUN_KIT.elementalBurst.hits).hitmarkSeconds * 60);

    expect(burstLanding).toBe(75);
    expect(Math.round(XIANYUN_KIT.elementalBurst.seconds * 60)).toBe(103);
    expect(XIANYUN_KIT.burstEnergyCost).toBe(70);
    expect(XIANYUN_KIT.burstCooldownSeconds).toBe(18);
  });

  test("a Constellation 1 switch adds one White Clouds at Dawn charge", () => {
    expect.hasAssertions();

    expect(XIANYUN_KIT.getSkillChargeBonus?.(createXianyunCombatant(1))).toBe(1);
  });

  test("a Constellation 0 switch adds no White Clouds at Dawn charge", () => {
    expect.hasAssertions();

    expect(XIANYUN_KIT.getSkillChargeBonus?.(createXianyunCombatant(0))).toBe(0);
  });

  test("a Constellation 2 White Clouds at Dawn gives Xianyun 20% ATK for 15 seconds", () => {
    expect.hasAssertions();

    expect(castKitAction(XIANYUN_KIT.elementalSkill, createXianyunCombatant(2)).effects).toStrictEqual([
      {
        amount: 0.2,
        attribute: Attribute.AttackPercent,
        characterId: XIANYUN_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 15,
        source: "xianyun-constellation-2",
      },
    ]);
  });

  test("a Constellation 1 White Clouds at Dawn gives Xianyun no ATK", () => {
    expect.hasAssertions();

    expect(castKitAction(XIANYUN_KIT.elementalSkill, createXianyunCombatant(1)).effects).toStrictEqual([]);
  });

  test("a second White Clouds at Dawn restarts the 15 seconds rather than stacking the ATK", () => {
    expect.hasAssertions();
    const combatant = createXianyunCombatant(2);
    const kitEffectState = castKitAction(XIANYUN_KIT.elementalSkill, combatant);
    stepKitSeconds(createKitTestContext(combatant, { kitEffectState }), 5);
    const buffs = castKitAction(XIANYUN_KIT.elementalSkill, combatant, kitEffectState).effects.filter(
      ({ kind }) => kind === "buff",
    );

    expect(buffs).toStrictEqual([
      {
        amount: 0.2,
        attribute: Attribute.AttackPercent,
        characterId: XIANYUN_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 15,
        source: "xianyun-constellation-2",
      },
    ]);
  });
});
