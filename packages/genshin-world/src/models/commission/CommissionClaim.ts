import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { ItemCount } from "#src/models/inventory/ItemCount";

// What a claim leaves: the day with its commission taken, the reward drawn for it, the bonus drawn on the day's fourth
// Claim, which is empty before it, and the Encounter Points left
export interface CommissionClaim {
  bonus: ItemCount[];
  day: CommissionDay;
  encounterPoints: number;
  rewards: ItemCount[];
}
