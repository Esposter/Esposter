import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemCategoryRoomMap } from "#src/models/inventory/ItemCategoryRoomMap";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { TrialStageClaim } from "#src/models/trial/TrialStageClaim";
import type { CharacterTrialTables } from "#src/services/trial/readCharacterTrials";

import { claimRewards } from "#src/services/reward/claimRewards";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The claim of a trial stage's first clear: its reward paid into the bag and the wallet, and the stage recorded
// As claimed. A later clear pays nothing and changes nothing. Undefined where the reward has no room left in the bag,
// Since the claim is refused whole
export const claimTrialStageReward = (
  stageId: number,
  { rewards, stages }: Pick<CharacterTrialTables, "rewards" | "stages">,
  claimedStageIds: ReadonlySet<number>,
  inventory: Inventory,
  wallet: Wallet,
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
  itemRooms: ItemCategoryRoomMap,
): TrialStageClaim | undefined => {
  if (claimedStageIds.has(stageId)) return { claimedStageIds, inventory, wallet };
  const stage = stages[String(stageId)];
  if (!stage) throw new InvalidOperationError(Operation.Read, String(stageId), "names no trial stage");
  const claim = claimRewards([stage.rewardId], rewards, inventory, wallet, names, materialDataMap, itemRooms);
  if (!claim) return undefined;
  return { claimedStageIds: new Set([...claimedStageIds, stageId]), inventory: claim.inventory, wallet: claim.wallet };
};
