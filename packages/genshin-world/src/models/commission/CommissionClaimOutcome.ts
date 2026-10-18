import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CommissionRouting } from "#src/models/commission/CommissionRouting";
import type { EncounterPoints } from "#src/models/commission/EncounterPoints";

// What a claim made with the points the save holds leaves: the day with the commission taken, the points held after the
// Spend, and where the claim's rewards were routed
export interface CommissionClaimOutcome {
  commissionDay: CommissionDay;
  encounterPoints: EncounterPoints;
  routing: CommissionRouting;
}
