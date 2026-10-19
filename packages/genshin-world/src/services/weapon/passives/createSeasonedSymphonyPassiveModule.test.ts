import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { createDeployedCombatant } from "#src/services/party/createDeployedCombatant.test";
import { createParty } from "#src/services/party/createParty";
import { createSeasonedSymphonyPassiveModule } from "#src/services/weapon/passives/createSeasonedSymphonyPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const readAttackPercent = (context: KitContext, combatant: Combatant): number =>
  getBuffedCombatant(combatant, context.kitEffectState.effects, context.party, context.characterIdCombatantMap)
    .attributes.attributeTotalMap[Attribute.AttackPercent];

describe(createSeasonedSymphonyPassiveModule, () => {
  // Synthetic params, not the weapon's row: 25% ATK, 50% more off-field, and 20% for two seconds to the wielder and
  // Each character it heals
  const seasonedSymphonyPassiveModule = createSeasonedSymphonyPassiveModule([0.25, 0.5, 0.2, 2]);
  const wielder: Combatant = createWielderCombatant();
  const healedCharacterId = 1;
  const createHealthChanged = (sourceCharacterId: number) => ({
    bondOfLifeShare: 0,
    characterId: healedCharacterId,
    healthShare: 0.2,
    isFallRefused: false,
    kind: KitEventKind.HealthChanged as const,
    overflowHealthShare: 0,
    sourceCharacterId,
  });

  test("the wielder's ATK is raised by the rank's percentage on the field and by the second percentage more off it", () => {
    expect.hasAssertions();

    expect(
      seasonedSymphonyPassiveModule.getPassiveBonuses?.(
        wielder,
        1,
        [createDeployedCombatant(wielder, { isOnField: true })],
        [],
      ),
    ).toStrictEqual([{ amount: 0.25, attribute: Attribute.AttackPercent }]);
    expect(
      seasonedSymphonyPassiveModule.getPassiveBonuses?.(
        wielder,
        1,
        [createDeployedCombatant(wielder, { isOnField: false })],
        [],
      ),
    ).toStrictEqual([{ amount: 0.75, attribute: Attribute.AttackPercent }]);
  });

  test("a heal the wielder initiates gives it and the character it healed Sweet Echoes for three seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder, { party: createParty([TRAVELER_CHARACTER_ID, healedCharacterId]) });
    seasonedSymphonyPassiveModule.onKitEvent?.(createHealthChanged(TRAVELER_CHARACTER_ID), context, wielder);
    const healed: Combatant = { ...wielder, characterId: healedCharacterId };

    expect(readAttackPercent(context, wielder)).toBe(0.2);
    expect(readAttackPercent(context, healed)).toBe(0.2);

    stepKitSeconds(context, 2.1);

    expect(readAttackPercent(context, wielder)).toBe(0);
  });

  test("a heal another party member initiates raises nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    seasonedSymphonyPassiveModule.onKitEvent?.(createHealthChanged(healedCharacterId), context, wielder);

    expect(readAttackPercent(context, wielder)).toBe(0);
  });
});
