import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitTestContext, readBuffTuples } from "#src/services/kit/createKitTestContext.test";
import { createCragChiseledForgePassiveModule } from "#src/services/weapon/passives/createCragChiseledForgePassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

// An Elemental Burst a member of the deployed team uses, which spends its Energy
const createBurstUsed = (characterId: number) => ({ characterId, energyCost: 0, kind: KitEventKind.BurstUsed });

describe(createCragChiseledForgePassiveModule, () => {
  const wielder = createWielderCombatant();
  // Crag-Chiseled Forge at its first rank: 40 Elemental Mastery for 18 seconds after each Elemental Burst, two at most
  const passiveModule = createCragChiseledForgePassiveModule([40, 18]);

  test("each Elemental Burst the wielder uses adds a stack for the rank's seconds, and a third is held at two", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createBurstUsed(TRAVELER_CHARACTER_ID), context, wielder);
    passiveModule.onKitEvent?.(createBurstUsed(TRAVELER_CHARACTER_ID), context, wielder);
    passiveModule.onKitEvent?.(createBurstUsed(TRAVELER_CHARACTER_ID), context, wielder);

    expect(readBuffTuples(context.kitEffectState.effects)).toStrictEqual([
      [Attribute.ElementalMastery, 40, 18],
      [Attribute.ElementalMastery, 40, 18],
    ]);
  });

  test("another member's Elemental Burst adds nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createBurstUsed(OTHER_CHARACTER_ID), context, wielder);

    expect(context.kitEffectState.effects).toStrictEqual([]);
  });
});
