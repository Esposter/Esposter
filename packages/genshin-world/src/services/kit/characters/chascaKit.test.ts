import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitInput } from "#src/models/kit/KitInput";

import { Element } from "#src/models/Element";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitPlunge } from "#src/models/kit/record/KitPlunge";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { CHASCA_CHARACTER_ID, createChascaKitBehaviour } from "#src/services/kit/characters/chascaKit";
import { XINGQIU_CHARACTER_ID } from "#src/services/kit/characters/xingqiuKit";
import { YOIMIYA_CHARACTER_ID } from "#src/services/kit/characters/yoimiyaKit";
import { NIGHTSOUL_BLESSING_STATUS_ID, NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { createKitState } from "#src/services/kit/createKitState";
import { createKitTestContext, sprintKitSeconds, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { readCharacterKitRecord } from "#src/services/kit/readCharacterKitRecord.test";
import { startNextKitAction } from "#src/services/kit/startNextKitAction";
import { stepDeployedKits } from "#src/services/kit/stepDeployedKits";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { stepPartyCooldowns } from "#src/services/party/stepPartyCooldowns";
import { takeOne } from "@esposter/shared";
import { createStamina, LocomotionState, STAMINA_MAX } from "genshin-engine";
import { assert, describe, expect, test } from "vitest";

const CHASCA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, CHASCA_CHARACTER_ID);
const { readFrameList, record: chascaRecord, toParameter } = await readCharacterKitRecord(CHASCA_CHARACTER_ID);
const toFrames = (seconds: number) => Math.round(seconds * 60);

// The shells Galesplitting casts, which its start puts on the team's effects as one summon
const readShells = ({ kitEffectState }: KitContext) => {
  const summon = kitEffectState.effects.find((effect) => effect.kind === "summon");
  return summon?.kind === "summon" ? summon.hits : [];
};

// The seconds stepped as the world steps them: the team's cooldowns, then its effects, then each deployed kit's own step
const stepWorldSeconds = (context: KitContext, seconds: number): void => {
  for (let stepIndex = 0; stepIndex < Math.round(seconds / FIXED_STEP_SECONDS); stepIndex++) {
    stepPartyCooldowns(context.party, FIXED_STEP_SECONDS);
    stepKitEffects(FIXED_STEP_SECONDS, context);
    stepDeployedKits(context, FIXED_STEP_SECONDS);
  }
};

const createChascaCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: CHASCA_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: CHASCA_KIT,
  level: 90,
});

describe(createChascaKitBehaviour, () => {
  const SKILL_INPUT: KitInput = {
    height: 0,
    isAttackHeld: false,
    isAttackPressed: false,
    isBurstPressed: false,
    isSkillHeld: false,
    isSkillPressed: true,
    locomotionState: LocomotionState.Idle,
  };

  // The skill pressed as the world presses it: the action its gates start, with the cooldown it sets and its start run
  const pressSkill = (context: KitContext): void => {
    const action = startNextKitAction(
      createKitState(),
      CHASCA_KIT,
      SKILL_INPUT,
      getPartyMember(context.party, CHASCA_CHARACTER_ID),
      createStamina(STAMINA_MAX),
      true,
      [],
      context,
    );
    action?.onStart?.(context);
  };

  test("reads her normal attacks and fully-charged Aimed Shot from her proud attack group", () => {
    expect.hasAssertions();
    const multipliers = [
      ...CHASCA_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      CHASCA_KIT.chargedAttack.hits[0]?.talentMultiplier ?? 0,
    ];
    expect(multipliers).toStrictEqual([
      expect.closeTo(0.4801, 3),
      expect.closeTo(0.4459, 3),
      expect.closeTo(0.297, 3),
      expect.closeTo(0.297, 3),
      expect.closeTo(0.2547, 3),
      expect.closeTo(1.24, 3),
    ]);
  });

  test("lands her normal attacks at their record's hitmarks, her third attack's two hits among them", () => {
    expect.hasAssertions();

    expect(
      CHASCA_KIT.normalAttacks.map((action) => ({
        frames: toFrames(action.seconds),
        hitmarks: action.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds)),
      })),
    ).toStrictEqual(
      chascaRecord.normalAttacks.map((action) => ({
        frames: action.animationFrames,
        hitmarks: action.hits.map(({ hitmarkFrames }) => hitmarkFrames),
      })),
    );
  });

  test("the fully-charged Aimed Shot lands at its record's hitmark and costs its record's stamina", () => {
    expect.hasAssertions();

    expect(toFrames(CHASCA_KIT.chargedAttack.seconds)).toBe(chascaRecord.chargedAttack.animationFrames);
    expect(toFrames(CHASCA_KIT.chargedAttack.hits[0]?.hitmarkSeconds ?? 0)).toBe(
      takeOne(chascaRecord.chargedAttack.hits).hitmarkFrames,
    );
    expect(CHASCA_KIT.chargedAttackStamina).toBe(toParameter(chascaRecord.chargedAttackStamina));
  });

  test("plunges land at their record's hitmarks, and the low plunge lasts its record's frames", () => {
    expect.hasAssertions();

    expect(toFrames(CHASCA_KIT.plungeCollision.hitmarkSeconds)).toBe(chascaRecord.plungeCollision.hitmarkFrames);
    expect(toFrames(CHASCA_KIT.lowPlunge.seconds)).toBe(chascaRecord.plunges[KitPlunge.Low].animationFrames);
    expect(CHASCA_KIT.lowPlunge.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual(
      chascaRecord.plunges[KitPlunge.Low].hits.map(({ hitmarkFrames }) => hitmarkFrames),
    );
  });

  test("spirit reins' resonance lands at its record's hitmark, on its record's cooldown", () => {
    expect.hasAssertions();

    expect(CHASCA_KIT.elementalSkill.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual(
      chascaRecord.skill.hits.map(({ hitmarkFrames }) => hitmarkFrames),
    );
    expect(CHASCA_KIT.skillCooldownSeconds).toBe(toParameter(chascaRecord.skillCooldownSeconds));
  });

  test("galesplitting lands at its record's hitmark, costing its record's energy on its record's cooldown", () => {
    expect.hasAssertions();

    expect(toFrames(CHASCA_KIT.elementalBurst.seconds)).toBe(chascaRecord.burst.animationFrames);
    expect(CHASCA_KIT.elementalBurst.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual(
      chascaRecord.burst.hits.map(({ hitmarkFrames }) => hitmarkFrames),
    );
    const { burstEnergyCost } = chascaRecord;
    assert(burstEnergyCost !== undefined);
    expect(CHASCA_KIT.burstEnergyCost).toBe(toParameter(burstEnergyCost));
    expect(CHASCA_KIT.burstCooldownSeconds).toBe(toParameter(chascaRecord.burstCooldownSeconds));
  });

  test("the skill's press enters the Nightsoul Blessing with 80 points, which drain eight a second", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createChascaCombatant());
    CHASCA_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 2);
    expect(countKitResource(context.kitEffectState.effects, CHASCA_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBeCloseTo(64);
  });

  test("the blessing ends when its points drain to none, ten seconds after the press", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createChascaCombatant());
    CHASCA_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 9.5);
    expect(checkHasKitStatus(context.kitEffectState.effects, CHASCA_CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID)).toBe(
      true,
    );
    stepKitSeconds(context, 1);
    expect(checkHasKitStatus(context.kitEffectState.effects, CHASCA_CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID)).toBe(
      false,
    );
  });

  test("a press inside the Nightsoul Blessing leaves it", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createChascaCombatant());
    CHASCA_KIT.elementalSkill.onStart?.(context);
    CHASCA_KIT.elementalSkill.onStart?.(context);
    expect(
      findKitStatus(context.kitEffectState.effects, CHASCA_CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID),
    ).toBeUndefined();
  });

  test("the skill cannot enter the Blessing again until its cooldown has run from her leaving it by a press", () => {
    expect.hasAssertions();

    const context = createKitTestContext(createChascaCombatant());
    pressSkill(context);
    stepWorldSeconds(context, 5);
    pressSkill(context);
    stepWorldSeconds(context, CHASCA_KIT.skillCooldownSeconds - 0.5);
    pressSkill(context);

    expect(checkHasKitStatus(context.kitEffectState.effects, CHASCA_CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID)).toBe(
      false,
    );

    stepWorldSeconds(context, 1);
    pressSkill(context);

    expect(checkHasKitStatus(context.kitEffectState.effects, CHASCA_CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID)).toBe(
      true,
    );
  });

  test("the skill cannot enter the Blessing again until its cooldown has run from its points draining to none", () => {
    expect.hasAssertions();

    const context = createKitTestContext(createChascaCombatant());
    pressSkill(context);
    stepWorldSeconds(context, 10 + CHASCA_KIT.skillCooldownSeconds - 0.5);
    pressSkill(context);

    expect(checkHasKitStatus(context.kitEffectState.effects, CHASCA_CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID)).toBe(
      false,
    );

    stepWorldSeconds(context, 1);
    pressSkill(context);

    expect(checkHasKitStatus(context.kitEffectState.effects, CHASCA_CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID)).toBe(
      true,
    );
  });

  test("a sprint in the Nightsoul Blessing drains 13.3 points once, however long the sprint runs", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createChascaCombatant());
    CHASCA_KIT.elementalSkill.onStart?.(context);
    sprintKitSeconds(context, createKitState(), 1);
    expect(countKitResource(context.kitEffectState.effects, CHASCA_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBeCloseTo(
      66.7,
    );
  });

  test("a sprint outside the Nightsoul Blessing drains nothing", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createChascaCombatant());
    sprintKitSeconds(context, createKitState(), 1);
    expect(countKitResource(context.kitEffectState.effects, CHASCA_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(0);
  });

  test("the skill's press ends the state only while the Blessing holds", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createChascaCombatant());
    expect(CHASCA_KIT.elementalSkill.checkIsStateEndingPress?.(context)).toBe(false);
    CHASCA_KIT.elementalSkill.onStart?.(context);
    expect(CHASCA_KIT.elementalSkill.checkIsStateEndingPress?.(context)).toBe(true);
  });

  test("galesplitting's six shells land at their record's frames", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createChascaCombatant());
    CHASCA_KIT.elementalBurst.onStart?.(context);
    expect(readShells(context).map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual(
      readFrameList("shellHitmarks"),
    );
  });

  test("each shell takes its enemy in turn by its place among the six", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createChascaCombatant());
    CHASCA_KIT.elementalBurst.onStart?.(context);
    expect(readShells(context).map(({ targetIndex }) => targetIndex)).toStrictEqual([0, 1, 2, 3, 4, 5]);
  });

  test("a team with no Pyro, Hydro, Electro or Cryo member makes all six shells Anemo", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createChascaCombatant());
    CHASCA_KIT.elementalBurst.onStart?.(context);
    expect(readShells(context).map(({ element }) => element)).toStrictEqual(
      Array.from({ length: 6 }, () => Element.Anemo),
    );
  });

  test("each Pyro, Hydro, Electro or Cryo party member's element is a Radiant shell twice over, shuffled by the kit's random source, and the rest are Anemo", () => {
    expect.hasAssertions();
    const chasca: Combatant = {
      ...createChascaCombatant(),
      deployedElements: [undefined, Element.Pyro, Element.Hydro],
    };
    // The four bullets' keys are 0.9, 0.1, 0.5 and 0.2 in the order they are dealt, so they sort Hydro, Hydro, Pyro, Pyro
    const draws = [0.9, 0.1, 0.5, 0.2];
    let drawIndex = 0;
    const context = createKitTestContext(chasca, {
      party: createParty([CHASCA_CHARACTER_ID, YOIMIYA_CHARACTER_ID, XINGQIU_CHARACTER_ID]),
      random: () => draws[drawIndex++] ?? 0,
    });
    CHASCA_KIT.elementalBurst.onStart?.(context);
    expect(readShells(context).map(({ element }) => element)).toStrictEqual([
      Element.Hydro,
      Element.Hydro,
      Element.Pyro,
      Element.Pyro,
      Element.Anemo,
      Element.Anemo,
    ]);
  });
});
