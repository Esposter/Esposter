import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES } from "#src/services/weapon/passives/constants";
import { createHonedFlowPassiveModule } from "#src/services/weapon/passives/createHonedFlowPassiveModule";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const readBuffs = (effects: readonly KitEffect[]) =>
  effects
    .filter((effect) => effect.kind === "buff")
    .map(({ amount, attribute, secondsRemaining }) => ({ amount, attribute, secondsRemaining }));

const createSkillUsed = (characterId: number) => ({ characterId, kind: KitEventKind.SkillUsed as const });

describe(createHonedFlowPassiveModule, () => {
  // Haran Geppaku Futsu at its first rank: each other deployed member's Elemental Skill gives the wielder a Wavespike stack,
  // Up to two and once every 0.3 seconds. The wielder's Elemental Skill consumes them all for Rippling Upheaval, which raises
  // Normal Attack DMG by 20% per stack consumed for eight seconds
  const honedFlowPassiveModule = createHonedFlowPassiveModule([0.12, 2, 0.3, 0.2, 8, 0, 0, 0]);
  const otherMemberCharacterId = -1;
  const wielder: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };
  const otherSkillUsed = createSkillUsed(otherMemberCharacterId);
  const wielderSkillUsed = createSkillUsed(TRAVELER_CHARACTER_ID);
  const createContext = () =>
    createKitTestContext(wielder, { party: createParty([TRAVELER_CHARACTER_ID, otherMemberCharacterId]) });

  test("the wielder gains 12% of each Elemental DMG Bonus", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    expect(
      honedFlowPassiveModule
        .getPassiveBonuses?.(wielder, 1, [{ ...wielder, isOnField: true }], context.kitEffectState.effects)
        ?.filter(({ attribute }) => ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES.includes(attribute)),
    ).toStrictEqual(ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES.map((attribute) => ({ amount: 0.12, attribute })));
  });

  test("another member's Elemental Skill gives the wielder a stack that the wielder's Elemental Skill consumes", () => {
    expect.hasAssertions();

    const context = createContext();
    honedFlowPassiveModule.onKitEvent?.(otherSkillUsed, context, wielder);
    honedFlowPassiveModule.onKitEvent?.(wielderSkillUsed, context, wielder);

    expect(readBuffs(context.kitEffectState.effects)).toStrictEqual([
      { amount: 0.2, attribute: Attribute.NormalAttackDamageBonus, secondsRemaining: 8 },
    ]);
  });

  test("the wielder's own Elemental Skill adds no stack", () => {
    expect.hasAssertions();

    const context = createContext();
    honedFlowPassiveModule.onKitEvent?.(wielderSkillUsed, context, wielder);

    expect(readBuffs(context.kitEffectState.effects)).toStrictEqual([]);
  });

  test("a second Elemental Skill of another member within 0.3 seconds of the last adds no stack", () => {
    expect.hasAssertions();

    const context = createContext();
    honedFlowPassiveModule.onKitEvent?.(otherSkillUsed, context, wielder);
    stepKitSeconds(context, 0.1);
    honedFlowPassiveModule.onKitEvent?.(otherSkillUsed, context, wielder);
    honedFlowPassiveModule.onKitEvent?.(wielderSkillUsed, context, wielder);

    expect(readBuffs(context.kitEffectState.effects)).toStrictEqual([
      { amount: 0.2, attribute: Attribute.NormalAttackDamageBonus, secondsRemaining: 8 },
    ]);
  });

  test("the stacks stop at two", () => {
    expect.hasAssertions();

    const context = createContext();
    honedFlowPassiveModule.onKitEvent?.(otherSkillUsed, context, wielder);
    stepKitSeconds(context, 0.5);
    honedFlowPassiveModule.onKitEvent?.(otherSkillUsed, context, wielder);
    stepKitSeconds(context, 0.5);
    honedFlowPassiveModule.onKitEvent?.(otherSkillUsed, context, wielder);
    honedFlowPassiveModule.onKitEvent?.(wielderSkillUsed, context, wielder);

    expect(readBuffs(context.kitEffectState.effects)).toStrictEqual([
      { amount: 2 * 0.2, attribute: Attribute.NormalAttackDamageBonus, secondsRemaining: 8 },
    ]);
  });

  test("the stacks wait for the wielder's Elemental Skill, however long that takes", () => {
    expect.hasAssertions();

    const context = createContext();
    honedFlowPassiveModule.onKitEvent?.(otherSkillUsed, context, wielder);
    stepKitSeconds(context, 30);
    honedFlowPassiveModule.onKitEvent?.(wielderSkillUsed, context, wielder);

    expect(readBuffs(context.kitEffectState.effects)).toStrictEqual([
      { amount: 0.2, attribute: Attribute.NormalAttackDamageBonus, secondsRemaining: 8 },
    ]);
  });

  test("the Rippling Upheaval ends eight seconds after the wielder's Elemental Skill", () => {
    expect.hasAssertions();

    const context = createContext();
    honedFlowPassiveModule.onKitEvent?.(otherSkillUsed, context, wielder);
    honedFlowPassiveModule.onKitEvent?.(wielderSkillUsed, context, wielder);
    stepKitSeconds(context, 8.1);

    expect(readBuffs(context.kitEffectState.effects).filter(({ amount }) => amount > 0)).toStrictEqual([]);
  });
});
