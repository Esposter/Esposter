import type { KitHealthChangedEvent } from "#src/models/kit/KitHealthChangedEvent";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitTestContext, readBuffTuples } from "#src/services/kit/createKitTestContext.test";
import { createMasonsDittyPassiveModule } from "#src/services/weapon/passives/createMasonsDittyPassiveModule";
import { ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES } from "#src/services/weapon/passives/constants";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

// A heal of a tenth of a member's Max HP on the member, given by the healer
const createHeal = (characterId: number, sourceCharacterId: number): KitHealthChangedEvent => ({
  bondOfLifeShare: 0,
  characterId,
  healthShare: 0.1,
  isFallRefused: false,
  kind: KitEventKind.HealthChanged,
  overflowHealthShare: 0,
  sourceCharacterId,
});
const skillUsed = { characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed };

describe(createMasonsDittyPassiveModule, () => {
  const wielder = createWielderCombatant();
  // Masons' Ditty (Prospector's Drill) at its first rank: 3% ATK and 7% All Elemental DMG for each Unity's Symbol consumed, for
  // Ten seconds, once every fifteen
  const passiveModule = createMasonsDittyPassiveModule([30, 10, 15, 0.03, 0.07]);

  test("a skill use turns the Symbols into the rank's ATK and All Elemental DMG for each, and a second use inside the cooldown consumes nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createHeal(TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID), context, wielder);
    passiveModule.onKitEvent?.(createHeal(OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID), context, wielder);
    passiveModule.onKitEvent?.(skillUsed, context, wielder);
    passiveModule.onKitEvent?.(createHeal(TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID), context, wielder);
    passiveModule.onKitEvent?.(skillUsed, context, wielder);

    expect(readBuffTuples(context.kitEffectState.effects)).toStrictEqual([
      [Attribute.AttackPercent, 0.03 * 2, 10],
      ...ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES.map((attribute) => [attribute, 0.07 * 2, 10]),
    ]);
  });
});
