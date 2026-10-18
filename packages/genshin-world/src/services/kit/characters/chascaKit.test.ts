import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitInput } from "#src/models/kit/KitInput";

import { Element } from "#src/models/Element";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { CHASCA_CHARACTER_ID, createChascaKitBehaviour } from "#src/services/kit/characters/chascaKit";
import { XINGQIU_CHARACTER_ID } from "#src/services/kit/characters/xingqiuKit";
import { YOIMIYA_CHARACTER_ID } from "#src/services/kit/characters/yoimiyaKit";
import { NIGHTSOUL_BLESSING_STATUS_ID, NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { createKitState } from "#src/services/kit/createKitState";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { hasKitNightsoulBlessing } from "#src/services/kit/effects/hasKitNightsoulBlessing";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { startNextKitAction } from "#src/services/kit/startNextKitAction";
import { stepDeployedKits } from "#src/services/kit/stepDeployedKits";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { stepPartyCooldowns } from "#src/services/party/stepPartyCooldowns";
import { createStamina, LocomotionState, STAMINA_MAX } from "genshin-engine";
import { describe, expect, test } from "vitest";

const CHASCA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, CHASCA_CHARACTER_ID);
const toFrames = (seconds: number) => Math.round(seconds * 60);

const createPartyMember = (characterId: number, element: Element): Combatant => ({
  ...createChascaCombatant(),
  characterId,
  element,
});

// The shells Galesplitting casts, which its start puts on the team's effects as one summon
const readShells = ({ kitEffectState }: KitContext) => {
  const summon = kitEffectState.effects.find((effect) => effect.kind === "summon");
  return summon?.kind === "summon" ? summon.hits : [];
};

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

  test("lands her normal attacks at gcsim's hitmarks, her third attack's two hits at 14 and 20 frames", () => {
    expect.hasAssertions();

    expect(
      CHASCA_KIT.normalAttacks.map((action) => ({
        frames: toFrames(action.seconds),
        hitmarks: action.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds)),
      })),
    ).toStrictEqual([
      { frames: 27, hitmarks: [10] },
      { frames: 29, hitmarks: [8] },
      { frames: 53, hitmarks: [14, 20] },
      { frames: 73, hitmarks: [39] },
    ]);
  });

  test("the fully-charged Aimed Shot lands at 86 frames of 96 and spends no stamina", () => {
    expect.hasAssertions();

    expect(toFrames(CHASCA_KIT.chargedAttack.seconds)).toBe(96);
    expect(toFrames(CHASCA_KIT.chargedAttack.hits[0]?.hitmarkSeconds ?? 0)).toBe(86);
    expect(CHASCA_KIT.chargedAttackStamina).toBe(0);
  });

  test("plunges land at gcsim's hitmarks, the collision at 44 frames and the low plunge at 50 of 80", () => {
    expect.hasAssertions();

    expect(toFrames(CHASCA_KIT.plungeCollision.hitmarkSeconds)).toBe(44);
    expect(toFrames(CHASCA_KIT.lowPlunge.seconds)).toBe(80);
    expect(CHASCA_KIT.lowPlunge.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual([50]);
  });

  test("spirit reins' resonance lands at 3 frames, on a 6.5 second cooldown", () => {
    expect.hasAssertions();

    expect(CHASCA_KIT.elementalSkill.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual([3]);
    expect(CHASCA_KIT.skillCooldownSeconds).toBe(6.5);
  });

  test("galesplitting lands at 96 frames of its 114-frame animation, costing 60 energy on a 15 second cooldown", () => {
    expect.hasAssertions();

    expect(toFrames(CHASCA_KIT.elementalBurst.seconds)).toBe(114);
    expect(CHASCA_KIT.elementalBurst.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual([96]);
    expect(CHASCA_KIT.burstEnergyCost).toBe(60);
    expect(CHASCA_KIT.burstCooldownSeconds).toBe(15);
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
    expect(hasKitNightsoulBlessing(context.kitEffectState.effects, CHASCA_CHARACTER_ID)).toBe(true);
    stepKitSeconds(context, 1);
    expect(hasKitNightsoulBlessing(context.kitEffectState.effects, CHASCA_CHARACTER_ID)).toBe(false);
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

    expect(hasKitNightsoulBlessing(context.kitEffectState.effects, CHASCA_CHARACTER_ID)).toBe(false);

    stepWorldSeconds(context, 1);
    pressSkill(context);

    expect(hasKitNightsoulBlessing(context.kitEffectState.effects, CHASCA_CHARACTER_ID)).toBe(true);
  });

  test("the skill cannot enter the Blessing again until its cooldown has run from its points draining to none", () => {
    expect.hasAssertions();

    const context = createKitTestContext(createChascaCombatant());
    pressSkill(context);
    stepWorldSeconds(context, 10 + CHASCA_KIT.skillCooldownSeconds - 0.5);
    pressSkill(context);

    expect(hasKitNightsoulBlessing(context.kitEffectState.effects, CHASCA_CHARACTER_ID)).toBe(false);

    stepWorldSeconds(context, 1);
    pressSkill(context);

    expect(hasKitNightsoulBlessing(context.kitEffectState.effects, CHASCA_CHARACTER_ID)).toBe(true);
  });

  test("a sprint in the Nightsoul Blessing drains 13.3 points", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createChascaCombatant());
    CHASCA_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 1);
    CHASCA_KIT.onSprint?.(context, createKitState());
    expect(countKitResource(context.kitEffectState.effects, CHASCA_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBeCloseTo(
      58.7,
    );
  });

  test("a sprint outside the Nightsoul Blessing drains nothing", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createChascaCombatant());
    CHASCA_KIT.onSprint?.(context, createKitState());
    expect(countKitResource(context.kitEffectState.effects, CHASCA_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(0);
  });

  test("the skill's press ends the state only while the Blessing holds", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createChascaCombatant());
    expect(CHASCA_KIT.elementalSkill.checkIsStateEndingPress?.(context)).toBe(false);
    CHASCA_KIT.elementalSkill.onStart?.(context);
    expect(CHASCA_KIT.elementalSkill.checkIsStateEndingPress?.(context)).toBe(true);
  });

  test("galesplitting's six shells land at gcsim's hitmarks, from 103 to 160 frames", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createChascaCombatant());
    CHASCA_KIT.elementalBurst.onStart?.(context);
    expect(readShells(context).map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual([
      103, 139, 147, 153, 157, 160,
    ]);
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
    const chasca = createChascaCombatant();
    const pyro = createPartyMember(YOIMIYA_CHARACTER_ID, Element.Pyro);
    const hydro = createPartyMember(XINGQIU_CHARACTER_ID, Element.Hydro);
    // The four bullets' keys are 0.9, 0.1, 0.5 and 0.2 in the order they are dealt, so they sort Hydro, Hydro, Pyro, Pyro
    const draws = [0.9, 0.1, 0.5, 0.2];
    let drawIndex = 0;
    const context = createKitTestContext(chasca, {
      characterIdCombatantMap: new Map([
        [CHASCA_CHARACTER_ID, chasca],
        [pyro.characterId, pyro],
        [hydro.characterId, hydro],
      ]),
      party: createParty([CHASCA_CHARACTER_ID, pyro.characterId, hydro.characterId]),
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
