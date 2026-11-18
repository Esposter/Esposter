import type { KitHealthChangedEvent } from "#src/models/kit/KitHealthChangedEvent";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitTestContext, readBuffTuples } from "#src/services/kit/createKitTestContext.test";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createSeaShantyPassiveModule } from "#src/services/weapon/passives/createSeaShantyPassiveModule";
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

describe(createSeaShantyPassiveModule, () => {
  const wielder = createWielderCombatant();
  // Sea Shanty (The Dockhand's Assistant) at its first rank: 40 Elemental Mastery and 2 Energy for each Stoic's Symbol
  // Consumed, each Symbol lasting 30 seconds, the Roused effect 10 seconds and its cooldown 15
  const passiveModule = createSeaShantyPassiveModule([30, 10, 15, 2, 40]);

  test("a heal the wielder receives or performs gains a Symbol, and a skill use turns each into the rank's Elemental Mastery", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createHeal(TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID), context, wielder);
    passiveModule.onKitEvent?.(createHeal(OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID), context, wielder);
    passiveModule.onKitEvent?.(skillUsed, context, wielder);

    expect(readBuffTuples(context.kitEffectState.effects)).toStrictEqual([[Attribute.ElementalMastery, 80, 10]]);
  });

  test("a heal between two other members gains no Symbol", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createHeal(OTHER_CHARACTER_ID, OTHER_CHARACTER_ID), context, wielder);
    passiveModule.onKitEvent?.(skillUsed, context, wielder);

    expect(readBuffTuples(context.kitEffectState.effects)).toStrictEqual([]);
  });

  test("the Symbols stop at three", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    for (let heal = 0; heal < 4; heal++)
      passiveModule.onKitEvent?.(createHeal(TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID), context, wielder);
    passiveModule.onKitEvent?.(skillUsed, context, wielder);

    expect(readBuffTuples(context.kitEffectState.effects)).toStrictEqual([[Attribute.ElementalMastery, 120, 10]]);
  });

  test("the Energy the Symbols restore comes two seconds after the Roused effect, two for each Symbol consumed", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    const startingEnergy = getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy;
    passiveModule.onKitEvent?.(createHeal(TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID), context, wielder);
    passiveModule.onKitEvent?.(createHeal(OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID), context, wielder);
    passiveModule.onKitEvent?.(skillUsed, context, wielder);
    const restoring = context.kitEffectState.effects.find(
      (effect) => effect.kind === "status" && effect.secondsRemaining === 2,
    );
    if (restoring?.kind !== "status") throw new Error("The Energy restore is not held");
    passiveModule.onKitEvent?.({ effect: restoring, kind: KitEventKind.EffectExpired }, context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy - startingEnergy).toBe(4);
  });

  test("a skill use inside the fifteen-second cooldown consumes nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createHeal(TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID), context, wielder);
    passiveModule.onKitEvent?.(skillUsed, context, wielder);
    passiveModule.onKitEvent?.(createHeal(TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID), context, wielder);
    passiveModule.onKitEvent?.(skillUsed, context, wielder);

    expect(readBuffTuples(context.kitEffectState.effects)).toStrictEqual([[Attribute.ElementalMastery, 40, 10]]);
  });
});
