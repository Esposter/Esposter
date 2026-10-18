import type { Combatant } from "#src/models/kit/Combatant";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { createItinerantHeroPassiveModule } from "#src/services/weapon/passives/createItinerantHeroPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { describe, expect, test } from "vitest";

const OTHER_CHARACTER_ID = 1;
const wielder: Combatant = createWielderCombatant();
// Itinerant Hero with synthetic params: 15% DMG, disabled for five seconds by taking DMG
const itinerantHeroPassiveModule = createItinerantHeroPassiveModule([0.15]);
const createEnemyStrikeLoss = () => ({
  characterId: TRAVELER_CHARACTER_ID,
  healthShare: -0.1,
  bondOfLifeShare: 0,
  isFallRefused: false,
  kind: KitEventKind.HealthChanged as const,
  overflowHealthShare: 0,
});

describe(createItinerantHeroPassiveModule, () => {
  test("the DMG bonus is priced on the wielder as a passive", () => {
    expect.hasAssertions();

    expect(itinerantHeroPassiveModule.getPassiveBonuses?.(wielder, 1, [], [])).toStrictEqual([
      { amount: 0.15, attribute: Attribute.AllDamageBonus },
    ]);
  });

  test("taking DMG takes the bonus off for five seconds, once however much DMG is taken", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    itinerantHeroPassiveModule.onKitEvent?.(createEnemyStrikeLoss(), context, wielder);
    itinerantHeroPassiveModule.onKitEvent?.(createEnemyStrikeLoss(), context, wielder);

    expect(
      context.kitEffectState.effects
        .filter((effect) => effect.kind === "buff")
        .map(({ amount, attribute, secondsRemaining }) => ({ amount, attribute, secondsRemaining })),
    ).toStrictEqual([{ amount: -0.15, attribute: Attribute.AllDamageBonus, secondsRemaining: 5 }]);
  });

  test("a loss another character caused takes nothing off", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    itinerantHeroPassiveModule.onKitEvent?.(
      { ...createEnemyStrikeLoss(), sourceCharacterId: OTHER_CHARACTER_ID },
      context,
      wielder,
    );

    expect(context.kitEffectState.effects).toStrictEqual([]);
  });
});
