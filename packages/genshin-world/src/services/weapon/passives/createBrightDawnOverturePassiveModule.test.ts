import type { Enemy } from "#src/models/enemy/Enemy";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createBrightDawnOverturePassiveModule } from "#src/services/weapon/passives/createBrightDawnOverturePassiveModule";
import { createWeaponStrike } from "#src/services/weapon/passives/createWeaponStrike.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createBrightDawnOverturePassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const party = createParty([TRAVELER_CHARACTER_ID]);
  const wielder = createWielderCombatant();
  const burningEnemy: Enemy = { ...enemy, burningCombatant: wielder };
  const createBurningTriggered = (striker: typeof wielder) => ({
    enemy,
    kind: KitEventKind.ReactionTriggered,
    reactions: [{ reactionType: ReactionType.Burning }],
    striker,
  });
  // Bright Dawn Overture at its first rank: 18% DMG for 8 seconds per stack, up to two, and 12 Energy at two stacks every 12s
  const passiveModule = createBrightDawnOverturePassiveModule([0.15, 0.18, 8, 12, 12]);

  test("a Burning the wielder triggers raises its DMG by the rank's amount for the rank's seconds", () => {
    expect.hasAssertions();

    const context = { ...createKitTestContext(wielder), party: structuredClone(party) };
    passiveModule.onKitEvent?.(createBurningTriggered(wielder), context, wielder);

    expect(
      passiveModule.getStrikeDamageBonus?.(
        createWeaponStrike(wielder, AttackTag.NormalAttack),
        enemy,
        party,
        context.kitEffectState.effects,
      ),
    ).toBe(0.18);

    stepKitSeconds(context, 8.1);

    expect(
      passiveModule.getStrikeDamageBonus?.(
        createWeaponStrike(wielder, AttackTag.NormalAttack),
        enemy,
        party,
        context.kitEffectState.effects,
      ),
    ).toBe(0);
  });

  test("a second stack restores the rank's Energy", () => {
    expect.hasAssertions();

    const context = { ...createKitTestContext(wielder), party: structuredClone(party) };
    passiveModule.onKitEvent?.(createBurningTriggered(wielder), context, wielder);
    passiveModule.onKitEvent?.(createBurningTriggered(wielder), context, wielder);

    expect(getPartyMember(context.party, wielder.characterId).energy).toBe(12);
  });

  test("a Dendro hit the wielder deals on a Burning enemy adds a stack too", () => {
    expect.hasAssertions();

    const context = { ...createKitTestContext(wielder), party: structuredClone(party) };
    passiveModule.onKitEvent?.(
      {
        attackTag: AttackTag.ElementalSkill,
        element: Element.Dendro,
        enemy: burningEnemy,
        kind: KitEventKind.EnemyHit,
        striker: wielder,
      },
      context,
      wielder,
    );

    expect(
      passiveModule.getStrikeDamageBonus?.(
        createWeaponStrike(wielder, AttackTag.NormalAttack),
        burningEnemy,
        party,
        context.kitEffectState.effects,
      ),
    ).toBe(0.18);
  });

  test("a Dendro hit on an enemy that is not Burning adds nothing", () => {
    expect.hasAssertions();

    const context = { ...createKitTestContext(wielder), party: structuredClone(party) };
    passiveModule.onKitEvent?.(
      {
        attackTag: AttackTag.ElementalSkill,
        element: Element.Dendro,
        enemy,
        kind: KitEventKind.EnemyHit,
        striker: wielder,
      },
      context,
      wielder,
    );

    expect(context.kitEffectState.effects).toStrictEqual([]);
  });
});
