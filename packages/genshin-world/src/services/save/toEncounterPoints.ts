import type { EncounterPoints } from "#src/models/commission/EncounterPoints";
import type { EncounterPointsSave } from "#src/models/commission/EncounterPointsSave";

// The Encounter Points read back from their save, the daily reset they were earned on read into its Temporal instant
export const toEncounterPoints = ({ earnedOn, halfPoints }: EncounterPointsSave): EncounterPoints => ({
  earnedOn: Temporal.Instant.from(earnedOn),
  halfPoints,
});
