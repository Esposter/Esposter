import type { ReactionType } from "#src/models/combat/ReactionType";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { createReactionTrigger } from "#src/services/artifact/sets/createReactionTrigger.test";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitCombatant } from "#src/services/kit/createKitCombatant.test";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { getPassiveKit } from "#src/services/kit/getPassiveKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { describe } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

// The Traveler wearing a set's four-piece and another member, in the party order given. The wearer's kit hears the events the
// Team sends, and reads the reactions a member makes in the party's hooks
export const createReactionSetTeam = (setModule: PassiveModule, characterIds: number[]) => {
  const wearer = createKitCombatant(TRAVELER_CHARACTER_ID, getPassiveKit(KIT, [setModule]));
  const other = createKitCombatant(OTHER_CHARACTER_ID, KIT);
  const kitEffectState: KitEffectState = { effects: [] };
  const party = createParty(characterIds);
  const characterIdCombatantMap = new Map([
    [OTHER_CHARACTER_ID, other],
    [TRAVELER_CHARACTER_ID, wearer],
  ]);
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const context = createKitTestContext(wearer, { characterIdCombatantMap, kitEffectState, party });
  const trigger = createReactionTrigger(enemy, context);
  // The DMG Bonus the wearer's kit adds to a reaction the given member makes, as the party's hook reads it
  const reactionDamageBonus = (combatant: Combatant, reactionType: ReactionType) =>
    wearer.kit.getPartyReactionBonus?.(wearer, { combatant, element: undefined, enemy, reactionType }, context)
      ?.damageBonus ?? 0;
  return { context, other, reactionDamageBonus, trigger, wearer };
};

describe.todo("createReactionSetTeam");
