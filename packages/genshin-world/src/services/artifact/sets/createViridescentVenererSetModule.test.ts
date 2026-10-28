import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { StellarReactionType } from "#src/models/combat/StellarReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { VIRIDESCENT_VENERER_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createViridescentVenererSetModule } from "#src/services/artifact/sets/createViridescentVenererSetModule";
import { getArtifactSetBonus } from "#src/services/artifact/sets/getArtifactSetBonus.test";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitCombatant } from "#src/services/kit/createKitCombatant.test";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { getPassiveKit } from "#src/services/kit/getPassiveKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

// The wearer, who wears four pieces, and another member, in the party order given. The wearer's kit hears the events
// The Team sends, and reads the reactions a member makes in the party's hooks
const createTeam = (characterIds: number[]) => {
  const wearer = createKitCombatant(
    TRAVELER_CHARACTER_ID,
    getPassiveKit(KIT, [
      createViridescentVenererSetModule(getArtifactSetBonus(statTables, VIRIDESCENT_VENERER_ARTIFACT_SET_ID, 4)),
    ]),
  );
  const other = createKitCombatant(OTHER_CHARACTER_ID, KIT);
  const kitEffectState: KitEffectState = { effects: [] };
  const party = createParty(characterIds);
  const characterIdCombatantMap = new Map([
    [OTHER_CHARACTER_ID, other],
    [TRAVELER_CHARACTER_ID, wearer],
  ]);
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const context = createKitTestContext(wearer, { characterIdCombatantMap, kitEffectState, party });
  // The DMG Bonus the wearer's kit adds to a reaction the given member makes, as the party's hook reads it
  const reactionDamageBonus = (combatant: Combatant, reactionType: StellarReactionType | TransformativeReactionType) =>
    wearer.kit.getPartyReactionBonus?.(wearer, { combatant, element: Element.Cryo, enemy, reactionType }, context)
      ?.damageBonus ?? 0;
  // A hit the striker lands on the enemy, which triggers the given reactions on it
  const trigger = (
    striker: Combatant,
    reactions: { element?: Element; reactionType: StellarReactionType | TransformativeReactionType }[],
  ) => {
    emitKitEvent({ enemy, kind: KitEventKind.ReactionTriggered, reactions, striker }, context);
  };
  return { enemy, other, reactionDamageBonus, trigger, wearer };
};

describe(createViridescentVenererSetModule, () => {
  test("the wearer's own Swirl reaction DMG is raised by 60%, and another member's Swirl is not", () => {
    expect.hasAssertions();

    const { other, reactionDamageBonus, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);

    expect(reactionDamageBonus(wearer, TransformativeReactionType.Swirl)).toBeCloseTo(0.6);
    expect(reactionDamageBonus(other, TransformativeReactionType.Swirl)).toBe(0);
  });

  test("the wearer's own Stellar Swirl DMG is raised by 20%, and another member's is not", () => {
    expect.hasAssertions();

    const { other, reactionDamageBonus, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);

    expect(reactionDamageBonus(wearer, StellarReactionType.StellarSwirl)).toBeCloseTo(0.2);
    expect(reactionDamageBonus(other, StellarReactionType.StellarSwirl)).toBe(0);
  });

  test("a Swirl the active wearer triggers lowers the RES of the element it swirls by 40% for 10 seconds", () => {
    expect.hasAssertions();

    const { enemy, trigger, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);
    trigger(wearer, [{ element: Element.Cryo, reactionType: TransformativeReactionType.Swirl }]);

    expect(enemy.statuses).toHaveLength(1);
    expect(
      enemy.statuses.map(({ resistanceReduction, secondsRemaining }) => ({ resistanceReduction, secondsRemaining })),
    ).toStrictEqual([{ resistanceReduction: { [Element.Cryo]: 0.4 }, secondsRemaining: 10 }]);
  });

  test("a second Swirl of the same element refreshes its RES debuff rather than stacking it", () => {
    expect.hasAssertions();

    const { enemy, trigger, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);
    trigger(wearer, [{ element: Element.Cryo, reactionType: TransformativeReactionType.Swirl }]);
    trigger(wearer, [{ element: Element.Cryo, reactionType: TransformativeReactionType.Swirl }]);

    expect(enemy.statuses).toHaveLength(1);
    expect(enemy.statuses.map(({ resistanceReduction }) => ({ resistanceReduction }))).toStrictEqual([
      { resistanceReduction: { [Element.Cryo]: 0.4 } },
    ]);
  });

  test("a Swirl another member triggers, or one the wearer triggers off the field, lowers no RES", () => {
    expect.hasAssertions();

    const { enemy, other, trigger, wearer } = createTeam([OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID]);
    trigger(other, [{ element: Element.Cryo, reactionType: TransformativeReactionType.Swirl }]);
    trigger(wearer, [{ element: Element.Cryo, reactionType: TransformativeReactionType.Swirl }]);

    expect(enemy.statuses).toHaveLength(0);
  });

  test("a Stellar Swirl the active wearer triggers lowers Cryo RES by 40%, the same debuff as a Cryo Swirl's", () => {
    expect.hasAssertions();

    const { enemy, trigger, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);
    trigger(wearer, [{ reactionType: StellarReactionType.StellarSwirl }]);

    expect(enemy.statuses).toHaveLength(1);
    expect(
      enemy.statuses.map(({ resistanceReduction, secondsRemaining }) => ({ resistanceReduction, secondsRemaining })),
    ).toStrictEqual([{ resistanceReduction: { [Element.Cryo]: 0.4 }, secondsRemaining: 10 }]);
  });
});
