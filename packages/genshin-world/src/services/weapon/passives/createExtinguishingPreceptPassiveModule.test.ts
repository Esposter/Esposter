import type { Combatant } from "#src/models/kit/Combatant";
import type { DeployedCombatant } from "#src/models/kit/DeployedCombatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES } from "#src/services/weapon/passives/constants";
import { createExtinguishingPreceptPassiveModule } from "#src/services/weapon/passives/createExtinguishingPreceptPassiveModule";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createExtinguishingPreceptPassiveModule, () => {
  // Extinguishing Precept at its first rank: its All Elemental DMG Bonus is a passive bonus. After an Elemental Skill, the
  // Wielder's ATK rises by 3.2% for each second of Consummation, up to six stacks, for 20 seconds, doubled while it is off the field
  const extinguishingPreceptPassiveModule = createExtinguishingPreceptPassiveModule([0.12, 1, 0.032, 6, 20]);
  const attackBonusPerSecond = 0.032;
  const wielder: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };
  const skillUsed = { characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed as const };
  const onField: DeployedCombatant[] = [{ ...wielder, isOnField: true }];
  const offField: DeployedCombatant[] = [{ ...wielder, isOnField: false }];

  test("the wielder gains 12% of each Elemental DMG Bonus", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    expect(
      extinguishingPreceptPassiveModule
        .getPassiveBonuses?.(wielder, 1, onField, context.kitEffectState.effects)
        ?.filter(({ attribute }) => ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES.includes(attribute)),
    ).toStrictEqual(ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES.map((attribute) => ({ amount: 0.12, attribute })));
  });

  test("after an Elemental Skill, ATK rises by 3.2% for each second that passes", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    extinguishingPreceptPassiveModule.onKitEvent?.(skillUsed, context, wielder);
    stepKitSeconds(context, 2.5);

    expect(
      extinguishingPreceptPassiveModule
        .getPassiveBonuses?.(wielder, 1, onField, context.kitEffectState.effects)
        ?.find(({ attribute }) => attribute === Attribute.AttackPercent)?.amount,
    ).toBe(2 * attackBonusPerSecond);
  });

  test("the ATK rise stops at six stacks", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    extinguishingPreceptPassiveModule.onKitEvent?.(skillUsed, context, wielder);
    stepKitSeconds(context, 7);

    expect(
      extinguishingPreceptPassiveModule
        .getPassiveBonuses?.(wielder, 1, onField, context.kitEffectState.effects)
        ?.find(({ attribute }) => attribute === Attribute.AttackPercent)?.amount,
    ).toBe(6 * attackBonusPerSecond);
  });

  test("the ATK rise is doubled while the wielder is off the field", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    extinguishingPreceptPassiveModule.onKitEvent?.(skillUsed, context, wielder);
    stepKitSeconds(context, 2.5);

    expect(
      extinguishingPreceptPassiveModule
        .getPassiveBonuses?.(wielder, 1, offField, context.kitEffectState.effects)
        ?.find(({ attribute }) => attribute === Attribute.AttackPercent)?.amount,
    ).toBe(4 * attackBonusPerSecond);
  });

  test("the Consummation ends twenty seconds after the Elemental Skill", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    extinguishingPreceptPassiveModule.onKitEvent?.(skillUsed, context, wielder);
    stepKitSeconds(context, 20.1);

    expect(
      extinguishingPreceptPassiveModule
        .getPassiveBonuses?.(wielder, 1, onField, context.kitEffectState.effects)
        ?.find(({ attribute }) => attribute === Attribute.AttackPercent)?.amount,
    ).toBe(0);
  });
});
