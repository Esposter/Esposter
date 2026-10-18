import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { ItemCount } from "#src/models/inventory/ItemCount";

// What a claim leaves: the day with its commission taken, the reward drawn for it, and the Encounter Points left
export interface CommissionClaim {
  day: CommissionDay;
  encounterPoints: number;
  rewards: ItemCount[];
}
