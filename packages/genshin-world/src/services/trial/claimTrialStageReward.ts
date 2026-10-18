import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { CharacterTrialTables } from "#src/services/trial/readCharacterTrials";
import type { TrialStageClaim } from "#src/models/trial/TrialStageClaim";

import { claimAbyssRewards } from "#src/services/reward/claimAbyssRewards";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The claim of a trial stage's first clear: its reward paid into the bag and the wallet, and the stage recorded as claimed. A
// Later clear pays nothing and changes nothing. Undefined where the reward has no room left in the bag, since the claim is refused whole
export const claimTrialStageReward = (
  stageId: number,
  { rewards, stages }: Pick<CharacterTrialTables, "rewards" | "stages">,
  claimedStageIds: ReadonlySet<number>,
  inventory: Inventory,
  wallet: Wallet,
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
): TrialStageClaim | undefined => {
  if (claimedStageIds.has(stageId)) return { claimedStageIds, inventory, wallet };
  const stage = stages[String(stageId)];
  if (!stage) throw new InvalidOperationError(Operation.Read, String(stageId), "names no trial stage");
  const claim = claimAbyssRewards([stage.rewardId], rewards, inventory, wallet, names, materialDataMap);
  if (!claim) return undefined;
  return { claimedStageIds: new Set([...claimedStageIds, stageId]), inventory: claim.inventory, wallet: claim.wallet };
};
