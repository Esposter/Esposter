import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createRadianceOnTheWaterPassiveModule } from "#src/services/weapon/passives/createRadianceOnTheWaterPassiveModule";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createRadianceOnTheWaterPassiveModule, () => {
  const wielder: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };

  // Radiance on the Water at its first rank: each Elemental Skill adds a stack of 52 Elemental Mastery for twelve
  // Seconds, up to two, each running its own seconds
  const passiveModule = createRadianceOnTheWaterPassiveModule([52, 12, 2]);
  const useSkill = (context: KitContext) =>
    passiveModule.onKitEvent?.({ characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed }, context, wielder);
  const readElementalMastery = ({ kitEffectState }: KitContext) =>
    passiveModule
      .getPassiveBonuses?.(wielder, 1, [], kitEffectState.effects)
      .find(({ attribute }) => attribute === Attribute.ElementalMastery)?.amount;

  test("each Elemental Skill adds a stack of 52 Elemental Mastery, up to two", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    useSkill(context);
    const oneStack = readElementalMastery(context);
    useSkill(context);
    useSkill(context);

    expect(oneStack).toBe(52);
    expect(readElementalMastery(context)).toBe(104);
  });

  test("each stack's duration is independent of the others", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    useSkill(context);
    stepKitSeconds(context, 6);
    useSkill(context);
    stepKitSeconds(context, 6.1);
    const afterFirstEnds = readElementalMastery(context);
    stepKitSeconds(context, 6);

    expect(afterFirstEnds).toBe(52);
    expect(readElementalMastery(context)).toBe(0);
  });
});
