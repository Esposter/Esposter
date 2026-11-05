import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { Character } from "#src/models/character/Character";
import type { FriendshipLevels } from "#src/models/friendship/FriendshipLevels";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { Party } from "#src/models/party/Party";
import type { BlossomClaimOffer } from "#src/models/originalResin/BlossomClaimOffer";
import type { RewardItem } from "#src/models/reward/RewardItem";
import type { RewardRouting } from "#src/models/reward/RewardRouting";

import { gainCompanionshipExp } from "#src/services/friendship/gainCompanionshipExp";
import { claimResinReward } from "#src/services/originalResin/claimResinReward";
import { COMPANIONSHIP_EXP_ITEM_ID } from "#src/services/originalResin/constants";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { countRewardItem } from "#src/services/reward/countRewardItem";
import { drawRewardItems } from "#src/services/reward/drawRewardItems";

// The Petrified Tree a cleared domain raises is claimed through the offer the player chose from the claim prompt, the
// Same prompt a ley line outcrop uses. Each of the offer's claims draws the tree's items from `treeRewards` by `random`,
// Each item's count between its least and most, and the one Resin claim every reward goes through takes the offer's price.
// The tree's Companionship EXP is the count its drawn items hold, given to the deployed team as a commission's is
export const claimPetrifiedTree = (
  adventureRankTables: AdventureRankTables,
  characters: readonly Character[],
  friendshipLevels: FriendshipLevels,
  party: Party,
  wallet: Wallet,
  inventory: Inventory,
  offer: BlossomClaimOffer,
  treeRewards: RewardItem[],
  random: () => number,
  adventureExp: number,
  completedMainQuestIds: ReadonlySet<string>,
  now: Temporal.Instant,
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
): RewardRouting | undefined => {
  const rewards = Array.from({ length: offer.claimCount }, () => drawRewardItems(treeRewards, random)).flat();
  const claim = claimResinReward(
    adventureRankTables,
    wallet,
    inventory,
    offer,
    rewards,
    adventureExp,
    completedMainQuestIds,
    now,
    names,
    materialDataMap,
  );
  if (!claim) return undefined;
  return {
    ...claim,
    characters: gainCompanionshipExp(
      characters,
      getDeployedCharacterIds(party),
      countRewardItem(rewards, COMPANIONSHIP_EXP_ITEM_ID),
      friendshipLevels,
    ),
  };
};
