import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitInput } from "#src/models/kit/KitInput";
import type { KitState } from "#src/models/kit/KitState";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { DILUC_CHARACTER_ID } from "#src/services/character/constants";
import { createDilucKit } from "#src/services/kit/characters/dilucKit";
import { createKitState } from "#src/services/kit/createKitState";
import { stepKitSummon } from "#src/services/kit/effects/stepKitSummon";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { stepKit } from "#src/services/kit/stepKit";
import { createPartyMember } from "#src/services/party/createPartyMember";
import { takeOne } from "@esposter/shared";
import { createStamina, LocomotionState, STAMINA_MAX } from "genshin-engine";
import { describe, expect, test } from "vitest";

const DILUC_KIT = createDilucKit(await readTalentMultipliers([DILUC_CHARACTER_ID]));
const DILUC_COMBATANT: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: DILUC_CHARACTER_ID,
  elementalResonances: [],
  kit: DILUC_KIT,
  level: 90,
};

const createCombatant = (ascension: number): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([]),
  characterId: DILUC_CHARACTER_ID,
  elementalResonances: [],
  kit: DILUC_KIT,
  level: 90,
});

describe("diluc kit", () => {
  test("reads each talent multiplier from its proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...DILUC_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      ...DILUC_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      DILUC_KIT.plungeCollision.talentMultiplier,
      takeOne(DILUC_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(DILUC_KIT.highPlunge.hits).talentMultiplier,
      takeOne(DILUC_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(DILUC_KIT.elementalBurst.hits).talentMultiplier,
    ];
    const expectedMultipliers = [0.897, 0.876, 0.988, 1.34, 0.688, 1.247, 0.895, 1.79, 2.2355, 0.944, 2.04];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test("infuses Pyro for 8 seconds with the burst, and for 12 with A4, which also gives a 20% Pyro damage bonus", () => {
    expect.hasAssertions();
    const body = { facing: 0, height: 0, position: { x: 0, z: 0 } };
    const kitEffectState: KitEffectState = { effects: [] };
    DILUC_KIT.elementalBurst.onStart?.({ body, combatant: createCombatant(3), kitEffectState });
    expect(kitEffectState.effects.filter(({ kind }) => kind !== "summon")).toStrictEqual([
      { characterId: DILUC_CHARACTER_ID, element: Element.Pyro, kind: "infusion", secondsRemaining: 8 },
    ]);

    kitEffectState.effects = [];
    DILUC_KIT.elementalBurst.onStart?.({ body, combatant: createCombatant(4), kitEffectState });
    expect(kitEffectState.effects.filter(({ kind }) => kind !== "summon")).toStrictEqual([
      { characterId: DILUC_CHARACTER_ID, element: Element.Pyro, kind: "infusion", secondsRemaining: 12 },
      {
        amount: 0.2,
        attribute: Attribute.PyroDamageBonus,
        characterId: DILUC_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 12,
      },
    ]);
  });

  const STEP_SECONDS = 0.1;
  const IDLE_INPUT: KitInput = {
    height: 0,
    isAttackHeld: false,
    isAttackPressed: false,
    isBurstPressed: false,
    isSkillHeld: false,
    isSkillPressed: false,
    locomotionState: LocomotionState.Idle,
  };
  const createFixture = () => {
    const kitState: KitState = createKitState();
    const partyMember = createPartyMember();
    const stamina = createStamina(STAMINA_MAX);
    const step = (isSkillPressed = false) => {
      const landedHits: never[] = [];
      return stepKit(
        kitState,
        DILUC_KIT,
        { ...IDLE_INPUT, isSkillPressed },
        partyMember,
        stamina,
        STEP_SECONDS,
        landedHits,
        {
          body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
          combatant: DILUC_COMBATANT,
          kitEffectState: { effects: [] },
        },
      );
    };
    // Steps with no press until the action playing has run its seconds
    const playOut = () => {
      for (let index = 0; index < 100 && kitState.action; index++) step();
    };
    // Steps with no press for the given seconds
    const wait = (seconds: number) => {
      for (let index = 0; index < Math.round(seconds / STEP_SECONDS); index++) step();
    };
    return { partyMember, playOut, step, wait };
  };

  test("searing onslaught plays its three presses in a row, each within the window of the one before, and starts the cooldown on the first", () => {
    expect.hasAssertions();
    const { partyMember, playOut, step, wait } = createFixture();
    expect(step(true)).toBe(DILUC_KIT.elementalSkill);
    expect(partyMember.skillCooldownSeconds).toBe(DILUC_KIT.skillCooldownSeconds);
    playOut();
    wait(0.5);
    expect(step(true)).toBe(takeOne(DILUC_KIT.elementalSkillChain?.followUps ?? []));
    playOut();
    wait(0.5);
    expect(step(true)).toBe(DILUC_KIT.elementalSkillChain?.followUps[1]);
    playOut();
    // The third press closes the chain, and the cooldown still holds the next first press back
    wait(0.5);
    expect(step(true)).toBeUndefined();
  });

  test("searing onslaught does not chain a press once its window has lapsed, and the cooldown holds the next first press", () => {
    expect.hasAssertions();
    const { partyMember, playOut, step, wait } = createFixture();
    expect(step(true)).toBe(DILUC_KIT.elementalSkill);
    playOut();
    wait(4.1);
    expect(step(true)).toBeUndefined();
    expect(partyMember.skillCooldownSeconds).toBeGreaterThan(0);
  });

  test("dawn's phoenix launches at the slash, travels 14 metres a second from a metre ahead, and explodes 24.8 metres on", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    DILUC_KIT.elementalBurst.onStart?.({
      body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
      combatant: createCombatant(0),
      kitEffectState,
    });
    const phoenix = takeOne(kitEffectState.effects.filter((effect): effect is KitSummon => effect.kind === "summon"));
    expect(phoenix.body.position.z).toBeCloseTo(-1, 5);

    const FRAME_SECONDS = 1 / 60;
    const explosionHits: number[] = [];
    const tickHits: number[] = [];
    for (let frame = 0; frame < 230; frame++)
      for (const { hit } of stepKitSummon(phoenix, FRAME_SECONDS))
        if (hit.hitArea.radius === 9.4) explosionHits.push(frame);
        else tickHits.push(frame);
    // Eight ticks, from the 12th frame after the slash's 100th, and the explosion at 202 frames
    expect(tickHits).toHaveLength(8);
    expect(explosionHits).toHaveLength(1);
    expect(phoenix.body.position.z).toBeLessThan(-24);
  });
});
