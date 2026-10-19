import type { KitContext } from "#src/models/kit/KitContext";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createDeployedCombatant } from "#src/services/party/createDeployedCombatant.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { createWhitehillsBestowalPassiveModule } from "#src/services/weapon/passives/createWhitehillsBestowalPassiveModule";
import { describe, expect, test } from "vitest";

describe(createWhitehillsBestowalPassiveModule, () => {
  const wielder = createWielderCombatant();

  // Whitehill's Bestowal at its first rank: 24% ATK for twelve seconds after an Elemental Skill, and while the wielder
  // Holds no Energy, another 24% ATK and 40% CRIT DMG
  const passiveModule = createWhitehillsBestowalPassiveModule([0.24, 12, 0.24, 0.4]);
  const readBonuses = ({ kitEffectState }: KitContext, energy: number) =>
    passiveModule.getPassiveBonuses?.(
      wielder,
      1,
      [createDeployedCombatant(wielder, { energy, isOnField: true })],
      kitEffectState.effects,
    );
  const createSkilledContext = (): KitContext => {
    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.({ characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed }, context, wielder);
    return context;
  };

  test.each([
    [
      40,
      [
        { amount: 0.24, attribute: Attribute.AttackPercent },
        { amount: 0, attribute: Attribute.CriticalDamage },
      ],
    ],
    [
      0,
      [
        { amount: 0.48, attribute: Attribute.AttackPercent },
        { amount: 0.4, attribute: Attribute.CriticalDamage },
      ],
    ],
  ])("after its Elemental Skill, a wielder with %s Energy gains %j", (energy, bonuses) => {
    expect.hasAssertions();

    expect(readBonuses(createSkilledContext(), energy)).toStrictEqual(bonuses);
  });

  test("it gives nothing before the skill, or 12 seconds after it", () => {
    expect.hasAssertions();

    const unskilledBonuses = readBonuses(createKitTestContext(wielder), 0);
    const context = createSkilledContext();
    stepKitSeconds(context, 12.1);

    expect(unskilledBonuses).toStrictEqual([]);
    expect(readBonuses(context, 0)).toStrictEqual([]);
  });
});
