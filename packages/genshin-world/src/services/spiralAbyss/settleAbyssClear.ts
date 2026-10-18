import type { AbyssCarryMember } from "#src/models/spiralAbyss/AbyssCarryMember";
import type { AbyssChallenge } from "#src/models/spiralAbyss/AbyssChallenge";
import type { AbyssChamber } from "#src/models/spiralAbyss/AbyssChamber";
import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";
import type { AbyssFloorReward } from "#src/models/spiralAbyss/AbyssFloorReward";
import type { AbyssProgress } from "#src/models/spiralAbyss/AbyssProgress";
import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { PartyMember } from "#src/models/party/PartyMember";

import { claimAbyssRewards } from "#src/services/spiralAbyss/claimAbyssRewards";
import { recordAbyssChamberClear } from "#src/services/spiralAbyss/recordAbyssChamberClear";

// A clear settled: the cycle's progress after it, the party's carry into the next chamber, and the bag and wallet its rewards paid
export interface AbyssClearSettlement {
  carry: AbyssCarryMember[];
  inventory: Inventory;
  progress: AbyssProgress;
  wallet: Wallet;
}

// A chamber's clear recorded and its first-time rewards claimed together. A bag with no room for the rewards refuses the whole
// Claim, so the clear records nothing and is settled again the next time the chamber is cleared
export const settleAbyssClear = ({
  challenge,
  chamber,
  characterIdMemberMap,
  floor,
  inventory,
  materialDataMap,
  names,
  progress,
  reward,
  rewardItems,
  wallet,
}: {
  challenge: AbyssChallenge;
  chamber: AbyssChamber;
  characterIdMemberMap: ReadonlyMap<number, PartyMember>;
  floor: AbyssFloor;
  inventory: Inventory;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  names: Readonly<Record<string, string>>;
  progress: AbyssProgress;
  reward: AbyssFloorReward;
  rewardItems: Readonly<Record<string, DroppedItem[]>>;
  wallet: Wallet;
}): AbyssClearSettlement | undefined => {
  const recorded = recordAbyssChamberClear(progress, floor, chamber, challenge, reward, characterIdMemberMap);
  const claim = claimAbyssRewards(recorded.givenRewardIds, rewardItems, inventory, wallet, names, materialDataMap);
  if (claim === undefined) return undefined;
  return { carry: recorded.carry, inventory: claim.inventory, progress: recorded.progress, wallet: claim.wallet };
};
