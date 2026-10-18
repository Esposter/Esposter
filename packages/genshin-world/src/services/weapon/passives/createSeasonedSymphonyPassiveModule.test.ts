import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { createSeasonedSymphonyPassiveModule } from "#src/services/weapon/passives/createSeasonedSymphonyPassiveModule";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const readAttackPercent = (context: KitContext, combatant: Combatant): number =>
  getBuffedCombatant(combatant, context.kitEffectState.effects, context.party, context.characterIdCombatantMap)
    .attributes.attributeTotalMap[Attribute.AttackPercent];

describe(createSeasonedSymphonyPassiveModule, () => {
  // Seasoned Symphony at its first rank: 12% ATK, 12% more off-field, and 32% for three seconds to the wielder and each
  // Character it heals
  const seasonedSymphonyPassiveModule = createSeasonedSymphonyPassiveModule([0.12, 0.12, 0.32, 3]);
  const wielder: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };
  const healedCharacterId = 1;
  const createHealthChanged = (sourceCharacterId: number) => ({
    characterId: healedCharacterId,
    healthShare: 0.2,
    kind: KitEventKind.HealthChanged as const,
    sourceCharacterId,
  });

  test("the wielder's ATK is raised by the rank's percentage on the field and by the second percentage more off it", () => {
    expect.hasAssertions();

    expect(
      seasonedSymphonyPassiveModule.getPassiveBonuses?.(wielder, 1, [{ ...wielder, isOnField: true }], []),
    ).toStrictEqual([{ amount: 0.12, attribute: Attribute.AttackPercent }]);
    expect(
      seasonedSymphonyPassiveModule.getPassiveBonuses?.(wielder, 1, [{ ...wielder, isOnField: false }], []),
    ).toStrictEqual([{ amount: 0.24, attribute: Attribute.AttackPercent }]);
  });

  test("a heal the wielder initiates gives it and the character it healed Sweet Echoes for three seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder, { party: createParty([TRAVELER_CHARACTER_ID, healedCharacterId]) });
    seasonedSymphonyPassiveModule.onKitEvent?.(createHealthChanged(TRAVELER_CHARACTER_ID), context, wielder);
    const healed: Combatant = { ...wielder, characterId: healedCharacterId };

    expect(readAttackPercent(context, wielder)).toBe(0.32);
    expect(readAttackPercent(context, healed)).toBe(0.32);

    stepKitSeconds(context, 3.1);

    expect(readAttackPercent(context, wielder)).toBe(0);
  });

  test("a heal another party member initiates raises nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    seasonedSymphonyPassiveModule.onKitEvent?.(createHealthChanged(healedCharacterId), context, wielder);

    expect(readAttackPercent(context, wielder)).toBe(0);
  });
});
