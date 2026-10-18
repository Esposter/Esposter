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
// Falcon's Defiance with synthetic params: the first, a static ATK line the module does not read, is passed as 0.
// Then a heal of 50% of ATK, a hit of 150% of ATK and a cooldown of three seconds
const aquilaFavoniaPassiveModule = createFalconsDefiancePassiveModule([0, 0.5, 1.5, 3]);
const createEnemyStrikeLoss = () => ({
  characterId: TRAVELER_CHARACTER_ID,
  healthShare: -0.1,
  bondOfLifeShare: 0,
  isFallRefused: false,
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
        healthShare: (0.5 * wielder.attributes.attack) / wielder.attributes.maxHealth,
        isFallRefused: false,
        overflowHealthShare: 0,
        sourceCharacterId: TRAVELER_CHARACTER_ID,
      },
    ]);
    expect(context.strikes.map(({ hit }) => hit.talentMultiplier)).toStrictEqual([1.5]);
  });

  test("taking DMG inside the three-second cooldown heals and queues nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    getPartyMember(context.party, TRAVELER_CHARACTER_ID).healthShare = 0.5;
    aquilaFavoniaPassiveModule.onKitEvent?.(createEnemyStrikeLoss(), context, wielder);
    stepKitSeconds(context, 2.5);
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
        healthShare: (0.5 * wielder.attributes.attack * (1 + ATTACK_BUFF)) / wielder.attributes.maxHealth,
        isFallRefused: false,
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
