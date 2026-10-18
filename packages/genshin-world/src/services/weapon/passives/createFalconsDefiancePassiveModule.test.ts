import type { Combatant } from "#src/models/kit/Combatant";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createFalconsDefiancePassiveModule } from "#src/services/weapon/passives/createFalconsDefiancePassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { describe, expect, test } from "vitest";

const ATTACK_BUFF = 0.25;
const OTHER_CHARACTER_ID = 1;
const wielder: Combatant = createWielderCombatant([
  { attribute: Attribute.BaseAttack, value: 1250 },
  { attribute: Attribute.BaseHealth, value: 10_000 },
]);
// Falcon's Defiance at its first rank: the ATK share it adds is a static line, so its params carry a heal of 100% of ATK,
// A hit of 200% of ATK and a cooldown of fifteen seconds
const aquilaFavoniaPassiveModule = createFalconsDefiancePassiveModule([0.2, 1, 2, 15]);
const createEnemyStrikeLoss = () => ({
  characterId: TRAVELER_CHARACTER_ID,
  healthShare: -0.1,
  bondOfLifeShare: 0,
  kind: KitEventKind.HealthChanged as const,
  overflowHealthShare: 0,
});

describe(createFalconsDefiancePassiveModule, () => {
  test("taking DMG heals the wielder by the rank's share of ATK and queues its hit on the surrounding opponents", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    getPartyMember(context.party, TRAVELER_CHARACTER_ID).healthShare = 0.5;
    aquilaFavoniaPassiveModule.onKitEvent?.(createEnemyStrikeLoss(), context, wielder);

    expect(context.party.healthChanges).toStrictEqual([
      {
        bondOfLifeShare: 0,
        characterId: TRAVELER_CHARACTER_ID,
        healthShare: wielder.attributes.attack / wielder.attributes.maxHealth,
        overflowHealthShare: 0,
        sourceCharacterId: TRAVELER_CHARACTER_ID,
      },
    ]);
    expect(context.strikes.map(({ hit }) => hit.talentMultiplier)).toStrictEqual([2]);
  });

  test("taking DMG inside the fifteen-second cooldown heals and queues nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    getPartyMember(context.party, TRAVELER_CHARACTER_ID).healthShare = 0.5;
    aquilaFavoniaPassiveModule.onKitEvent?.(createEnemyStrikeLoss(), context, wielder);
    stepKitSeconds(context, 10);
    aquilaFavoniaPassiveModule.onKitEvent?.(createEnemyStrikeLoss(), context, wielder);

    expect(context.party.healthChanges).toHaveLength(1);
    expect(context.strikes).toStrictEqual([]);
  });

  test("the heal is the rank's share of the wielder's ATK with its buffs on", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    buffKitMember(context.kitEffectState, TRAVELER_CHARACTER_ID, {
      amount: ATTACK_BUFF,
      attribute: Attribute.AttackPercent,
      secondsRemaining: 10,
      source: "test",
    });
    getPartyMember(context.party, TRAVELER_CHARACTER_ID).healthShare = 0.5;
    aquilaFavoniaPassiveModule.onKitEvent?.(createEnemyStrikeLoss(), context, wielder);

    expect(context.party.healthChanges).toStrictEqual([
      {
        bondOfLifeShare: 0,
        characterId: TRAVELER_CHARACTER_ID,
        healthShare: (wielder.attributes.attack * (1 + ATTACK_BUFF)) / wielder.attributes.maxHealth,
        overflowHealthShare: 0,
        sourceCharacterId: TRAVELER_CHARACTER_ID,
      },
    ]);
  });

  test("a loss another character caused heals and queues nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    aquilaFavoniaPassiveModule.onKitEvent?.(
      { ...createEnemyStrikeLoss(), sourceCharacterId: OTHER_CHARACTER_ID },
      context,
      wielder,
    );

    expect(context.party.healthChanges).toHaveLength(0);
    expect(context.strikes).toHaveLength(0);
  });
});
