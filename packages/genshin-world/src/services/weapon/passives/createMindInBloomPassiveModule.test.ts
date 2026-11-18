import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createParty } from "#src/services/party/createParty";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { createMindInBloomPassiveModule } from "#src/services/weapon/passives/createMindInBloomPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

const readElementalMastery = (context: KitContext, wielder: Combatant): number =>
  getBuffedCombatant(wielder, context.kitEffectState.effects, context.party, context.characterIdCombatantMap).attributes
    .attributeTotalMap[Attribute.ElementalMastery];

describe(createMindInBloomPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const party = createParty([TRAVELER_CHARACTER_ID]);
  const wielder = createWielderCombatant();
  const other = { ...wielder, characterId: OTHER_CHARACTER_ID };
  const createReactionTriggered = (reactionType: ReactionType, striker: Combatant) => ({
    enemy,
    kind: KitEventKind.ReactionTriggered,
    reactions: [{ reactionType }],
    striker,
  });
  // Mind in Bloom at its first rank: 12 Energy and 60 Elemental Mastery for 15 seconds, at most once every 15 seconds
  const passiveModule = createMindInBloomPassiveModule([12, 60, 15, 15]);

  test("a Bloom reaction triggered by anyone restores the rank's Energy and raises Elemental Mastery for the rank's seconds", () => {
    expect.hasAssertions();

    const context = { ...createKitTestContext(wielder), party: structuredClone(party) };
    passiveModule.onKitEvent?.(createReactionTriggered(ReactionType.Bloom, other), context, wielder);

    expect(getPartyMember(context.party, wielder.characterId).energy).toBe(12);
    expect(readElementalMastery(context, wielder)).toBe(60);

    stepKitSeconds(context, 15.1);

    expect(readElementalMastery(context, wielder)).toBe(0);
  });

  test("a reaction outside the named set raises nothing", () => {
    expect.hasAssertions();

    const context = { ...createKitTestContext(wielder), party: structuredClone(party) };
    passiveModule.onKitEvent?.(createReactionTriggered(ReactionType.Swirl, wielder), context, wielder);

    expect(getPartyMember(context.party, wielder.characterId).energy).toBe(0);
    expect(readElementalMastery(context, wielder)).toBe(0);
  });

  test("a second named reaction inside the rank's cooldown restores nothing", () => {
    expect.hasAssertions();

    const context = { ...createKitTestContext(wielder), party: structuredClone(party) };
    passiveModule.onKitEvent?.(createReactionTriggered(ReactionType.LunarCharged, wielder), context, wielder);
    stepKitSeconds(context, 5);
    passiveModule.onKitEvent?.(createReactionTriggered(ReactionType.Crystallize, wielder), context, wielder);

    expect(getPartyMember(context.party, wielder.characterId).energy).toBe(12);
  });
});
