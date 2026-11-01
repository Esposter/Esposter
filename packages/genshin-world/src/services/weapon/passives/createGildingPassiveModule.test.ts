import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { damagePartyMember } from "#src/services/party/damagePartyMember";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createGildingPassiveModule } from "#src/services/weapon/passives/createGildingPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const createBurstUsed = () => ({
  characterId: TRAVELER_CHARACTER_ID,
  energyCost: 0,
  kind: KitEventKind.BurstUsed as const,
});

describe(createGildingPassiveModule, () => {
  // Gilding with synthetic params: eight seconds, a tick every two seconds, and on each tick three energy and 5%
  // Of Max HP, given to the deployed team
  const gildingPassiveModule = createGildingPassiveModule([8, 2, 3, 0.05]);

  test("a burst regenerates the wielder's energy every two seconds for eight seconds", () => {
    expect.hasAssertions();

    const wielder = createWielderCombatant([{ attribute: Attribute.Health, value: 1000 }]);
    const context = createKitTestContext(wielder);
    gildingPassiveModule.onKitEvent?.(createBurstUsed(), context, wielder);

    stepKitSeconds(context, 2.1);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBeCloseTo(3);

    stepKitSeconds(context, 6.1);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBeCloseTo(12);
  });

  test("a burst heals the deployed team by the rank's share of Max HP on each tick", () => {
    expect.hasAssertions();

    const wielder = createWielderCombatant([{ attribute: Attribute.Health, value: 1000 }]);
    const context = createKitTestContext(wielder);
    damagePartyMember(context.party, TRAVELER_CHARACTER_ID, 0.5);
    gildingPassiveModule.onKitEvent?.(createBurstUsed(), context, wielder);

    stepKitSeconds(context, 6.1);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).healthShare).toBeCloseTo(0.65);
  });
});
