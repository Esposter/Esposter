import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import {
  createMizukiKitBehaviour,
  DREAMDRIFTER_STATUS_ID,
  MIZUKI_CHARACTER_ID,
} from "#src/services/kit/characters/mizukiKit";
import { YOIMIYA_CHARACTER_ID } from "#src/services/kit/characters/yoimiyaKit";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const MIZUKI_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, MIZUKI_CHARACTER_ID);

const createMizukiCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: MIZUKI_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: MIZUKI_KIT,
  level: 90,
});

// The summon her skill's press casts, which carries the clouds that have not yet landed or been cancelled
const readCloudSummon = ({ kitEffectState }: KitContext): KitSummon | undefined => {
  const summon = kitEffectState.effects.find((effect) => effect.kind === "summon");
  return summon?.kind === "summon" ? summon : undefined;
};

const readCloudFrames = (context: KitContext): number[] =>
  (readCloudSummon(context)?.hits ?? []).map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60));

describe(createMizukiKitBehaviour, () => {
  test("reads each talent multiplier, cooldown and cost from her proud skill groups, to four decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...MIZUKI_KIT.normalAttacks.map(({ hits }) => hits[0]?.talentMultiplier),
      MIZUKI_KIT.chargedAttack.hits[0]?.talentMultiplier,
      MIZUKI_KIT.plungeCollision.talentMultiplier,
      MIZUKI_KIT.lowPlunge.hits[0]?.talentMultiplier,
      MIZUKI_KIT.highPlunge.hits[0]?.talentMultiplier,
      MIZUKI_KIT.elementalSkill.hits[0]?.talentMultiplier,
      MIZUKI_KIT.elementalBurst.hits[0]?.talentMultiplier,
    ].map((multiplier) => Number(multiplier?.toFixed(4)));

    expect(multipliers).toStrictEqual([0.5228, 0.4691, 0.7137, 1.3, 0.5683, 1.1363, 1.4193, 0.5774, 0.9408]);
    expect([
      MIZUKI_KIT.chargedAttackStamina,
      MIZUKI_KIT.skillCooldownSeconds,
      MIZUKI_KIT.burstCooldownSeconds,
      MIZUKI_KIT.burstEnergyCost,
    ]).toStrictEqual([50, 15, 15, 60]);
  });

  test("lands her strikes ten frames after their hitmarks, her charged attack at 39 frames, her skill's activation at 2, and her burst at 93", () => {
    expect.hasAssertions();
    expect({
      burstHitmarkFrames: MIZUKI_KIT.elementalBurst.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
      chargedAttackHitmarkFrames: MIZUKI_KIT.chargedAttack.hits.map(({ hitmarkSeconds }) =>
        Math.round(hitmarkSeconds * 60),
      ),
      normalAttackHitmarkFrames: MIZUKI_KIT.normalAttacks.map(({ hits }) =>
        Math.round((hits[0]?.hitmarkSeconds ?? 0) * 60),
      ),
      skillHitmarkFrames: MIZUKI_KIT.elementalSkill.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
    }).toStrictEqual({
      burstHitmarkFrames: [93],
      chargedAttackHitmarkFrames: [39],
      normalAttackHitmarkFrames: [17, 29, 47],
      skillHitmarkFrames: [2],
    });
  });

  test("the skill's press enters the Dreamdrifter state, which lasts five seconds", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createMizukiCombatant());
    MIZUKI_KIT.elementalSkill.onStart?.(context);
    expect(checkIsKitStatusActive(context.kitEffectState.effects, MIZUKI_CHARACTER_ID, DREAMDRIFTER_STATUS_ID)).toBe(
      true,
    );
    stepKitSeconds(context, 4.9);
    expect(checkIsKitStatusActive(context.kitEffectState.effects, MIZUKI_CHARACTER_ID, DREAMDRIFTER_STATUS_ID)).toBe(
      true,
    );
    stepKitSeconds(context, 0.2);
    expect(checkIsKitStatusActive(context.kitEffectState.effects, MIZUKI_CHARACTER_ID, DREAMDRIFTER_STATUS_ID)).toBe(
      false,
    );
  });

  test("the skill's press ends the state only while the Dreamdrifter lasts", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createMizukiCombatant());
    MIZUKI_KIT.elementalSkill.onStart?.(context);
    expect(MIZUKI_KIT.elementalSkill.checkIsStateEndingPress?.(context)).toBe(true);
    stepKitSeconds(context, 5);
    expect(MIZUKI_KIT.elementalSkill.checkIsStateEndingPress?.(context)).toBe(false);
  });

  test("the Dreamdrifter state lets her start no normal attack, charged attack or plunge while it lasts, and any once it ends", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createMizukiCombatant());
    const attacks = [
      ...MIZUKI_KIT.normalAttacks,
      MIZUKI_KIT.chargedAttack,
      MIZUKI_KIT.highPlunge,
      MIZUKI_KIT.lowPlunge,
    ];
    const checkCanStartAttacks = () => attacks.map((action) => action.canStart?.(context));
    expect(checkCanStartAttacks()).toStrictEqual(attacks.map(() => true));
    expect(MIZUKI_KIT.plungeCollision.landsWhen?.(context)).toBe(true);
    MIZUKI_KIT.elementalSkill.onStart?.(context);
    expect(checkCanStartAttacks()).toStrictEqual(attacks.map(() => false));
    expect(MIZUKI_KIT.plungeCollision.landsWhen?.(context)).toBe(false);
    stepKitSeconds(context, 5);
    expect(checkCanStartAttacks()).toStrictEqual(attacks.map(() => true));
    expect(MIZUKI_KIT.plungeCollision.landsWhen?.(context)).toBe(true);
  });

  test("a press in the Dreamdrifter state cancels it", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createMizukiCombatant());
    MIZUKI_KIT.elementalSkill.onStart?.(context);
    MIZUKI_KIT.elementalSkill.onStart?.(context);
    expect(checkIsKitStatusActive(context.kitEffectState.effects, MIZUKI_CHARACTER_ID, DREAMDRIFTER_STATUS_ID)).toBe(
      false,
    );
  });

  test("the skill's press starts seven clouds, the first landing 48 frames after it and each 45 frames after that", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createMizukiCombatant());
    MIZUKI_KIT.elementalSkill.onStart?.(context);
    expect(readCloudFrames(context)).toStrictEqual([48, 93, 138, 183, 228, 273, 318]);
  });

  test("each cloud is dealt as an elemental skill", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createMizukiCombatant());
    MIZUKI_KIT.elementalSkill.onStart?.(context);
    expect(readCloudSummon(context)?.attackTag).toBe(AttackTag.ElementalSkill);
  });

  test("a press in the Dreamdrifter state cancels the clouds not yet launched, and the one in flight still lands", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createMizukiCombatant());
    MIZUKI_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 0.5);
    MIZUKI_KIT.elementalSkill.onStart?.(context);
    expect(readCloudFrames(context)).toStrictEqual([48]);
  });

  test("swapping Mizuki out ends the Dreamdrifter state, and the clouds not yet launched with it", () => {
    expect.hasAssertions();
    const combatant = createMizukiCombatant();
    const context = createKitTestContext(combatant);
    MIZUKI_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 0.5);
    MIZUKI_KIT.onKitEvent?.(
      {
        characterId: YOIMIYA_CHARACTER_ID,
        kind: KitEventKind.CharacterSwapped,
        previousCharacterId: MIZUKI_CHARACTER_ID,
      },
      context,
      combatant,
    );
    expect(checkIsKitStatusActive(context.kitEffectState.effects, MIZUKI_CHARACTER_ID, DREAMDRIFTER_STATUS_ID)).toBe(
      false,
    );
    expect(readCloudFrames(context)).toStrictEqual([48]);
  });
});
