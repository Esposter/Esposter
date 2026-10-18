import type { InvestigationDay } from "#src/models/investigation/InvestigationDay";
import type { InvestigationDaySave } from "#src/models/investigation/InvestigationDaySave";

// The game day's investigations as their save holds them, the day's key as its ISO string and empty before the first
export const toInvestigationDaySave = ({ count, dayKey }: InvestigationDay): InvestigationDaySave => ({
  count,
  dayKey: dayKey?.toString() ?? "",
});
