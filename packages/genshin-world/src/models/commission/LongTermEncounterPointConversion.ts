import type { EncounterPoints } from "#src/models/commission/EncounterPoints";
import type { LongTermEncounterPoints } from "#src/models/commission/LongTermEncounterPoints";
import type { Wallet } from "#src/models/inventory/Wallet";

// What a conversion of a Long-Term Encounter Point leaves: the daily points with the point added, the long-term points with
// It taken out, and the wallet with the Original Resin spent
export interface LongTermEncounterPointConversion {
  encounterPoints: EncounterPoints;
  longTermEncounterPoints: LongTermEncounterPoints;
  wallet: Wallet;
}
