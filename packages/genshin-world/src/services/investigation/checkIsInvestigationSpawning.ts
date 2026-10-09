import { INVESTIGATION_DAILY_CAP } from "#src/services/investigation/constants";

// Whether investigation spots still spawn once this many have been investigated in the game day
export const checkIsInvestigationSpawning = (investigationsToday: number): boolean =>
  investigationsToday < INVESTIGATION_DAILY_CAP;
