import type { KitHealthChangedEvent } from "#src/models/kit/KitHealthChangedEvent";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitTestContext, readBuffTuples, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createParty } from "#src/services/party/createParty";
import { createDawnAndDuskByTheLakePassiveModule } from "#src/services/weapon/passives/createDawnAndDuskByTheLakePassiveModule";
import { createWeaponStrike } from "#src/services/weapon/passives/createWeaponStrike.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

// A change of a tenth of a member's Max HP on the member, as a heal or a drain of its own
const createHealthChange = (characterId: number): KitHealthChangedEvent => ({
  bondOfLifeShare: 0,
  characterId,
  healthShare: 0.1,
  healthShareBefore: 0.9,
  isFallRefused: false,
  kind: KitEventKind.HealthChanged,
  overflowHealthShare: 0,
});

describe(createDawnAndDuskByTheLakePassiveModule, () => {
  const wielder = createWielderCombatant();
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const party = createParty([TRAVELER_CHARACTER_ID]);
  // Dawn and Dusk by the Lake (Splendor of Tranquil Waters) at its first rank: 8% Elemental Skill DMG for each stack of
  // The wielder's own HP changes, up to three, and 14% Max HP for each of the others', up to two. Each stack waits out
  // A 0.2 second Cooldown, and each stack added restarts the six seconds of all of them, as addPassiveStack does
  const passiveModule = createDawnAndDuskByTheLakePassiveModule([0.08, 6, 0.2, 0.14, 6, 0.2]);

  test("the wielder's own HP change gives a stack of Elemental Skill DMG, which a skill hit reads, and a normal attack reads none of it", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createHealthChange(TRAVELER_CHARACTER_ID), context, wielder);

    expect(
      passiveModule.getStrikeDamageBonus?.(
        createWeaponStrike(wielder, AttackTag.ElementalSkill),
        enemy,
        party,
        context.kitEffectState.effects,
      ),
    ).toBe(0.08);
    expect(
      passiveModule.getStrikeDamageBonus?.(
        createWeaponStrike(wielder, AttackTag.NormalAttack),
        enemy,
        party,
        context.kitEffectState.effects,
      ),
    ).toBe(0);
  });

  test("the stacks of Elemental Skill DMG come once each cooldown and stop at three", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createHealthChange(TRAVELER_CHARACTER_ID), context, wielder);
    passiveModule.onKitEvent?.(createHealthChange(TRAVELER_CHARACTER_ID), context, wielder);
    for (let change = 0; change < 3; change++) {
      stepKitSeconds(context, 0.5);
      passiveModule.onKitEvent?.(createHealthChange(TRAVELER_CHARACTER_ID), context, wielder);
    }

    expect(
      passiveModule.getStrikeDamageBonus?.(
        createWeaponStrike(wielder, AttackTag.ElementalSkill),
        enemy,
        party,
        context.kitEffectState.effects,
      ),
    ).toBe(0.08 * 3);
  });

  test("another member's HP change gives a stack of Max HP, and each new stack restarts the six seconds of all of them, two at most", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createHealthChange(OTHER_CHARACTER_ID), context, wielder);

    expect(readBuffTuples(context.kitEffectState.effects)).toStrictEqual([[Attribute.HealthPercent, 0.14, 6]]);

    stepKitSeconds(context, 0.5);
    passiveModule.onKitEvent?.(createHealthChange(OTHER_CHARACTER_ID), context, wielder);
    stepKitSeconds(context, 0.5);
    passiveModule.onKitEvent?.(createHealthChange(OTHER_CHARACTER_ID), context, wielder);

    expect(readBuffTuples(context.kitEffectState.effects)).toStrictEqual([[Attribute.HealthPercent, 0.14 * 2, 6]]);
  });

  test("another member's HP change adds no Elemental Skill DMG, and the wielder's own adds no Max HP", () => {
    expect.hasAssertions();

    const otherChangeContext = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createHealthChange(OTHER_CHARACTER_ID), otherChangeContext, wielder);

    expect(
      passiveModule.getStrikeDamageBonus?.(
        createWeaponStrike(wielder, AttackTag.ElementalSkill),
        enemy,
        party,
        otherChangeContext.kitEffectState.effects,
      ),
    ).toBe(0);

    const ownChangeContext = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createHealthChange(TRAVELER_CHARACTER_ID), ownChangeContext, wielder);

    expect(readBuffTuples(ownChangeContext.kitEffectState.effects)).toStrictEqual([]);
  });
});
