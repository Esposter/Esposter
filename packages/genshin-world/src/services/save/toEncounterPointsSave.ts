import type { EncounterPoints } from "#src/models/commission/EncounterPoints";
import type { EncounterPointsSave } from "#src/models/commission/EncounterPointsSave";

// The Encounter Points as their save holds them, the daily reset they were earned on as its ISO string
export const toEncounterPointsSave = ({ earnedOn, halfPoints }: EncounterPoints): EncounterPointsSave => ({
  earnedOn: earnedOn.toString(),
  halfPoints,
});
