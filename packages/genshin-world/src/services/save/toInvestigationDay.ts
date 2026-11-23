import type { InvestigationDay } from "#src/models/investigation/InvestigationDay";
import type { InvestigationDaySave } from "#src/models/investigation/InvestigationDaySave";

// The game day's investigations read back from their save, the day's key read into its Temporal instant when it has one
export const toInvestigationDay = ({ count, dayKey }: InvestigationDaySave): InvestigationDay => ({
  count,
  // eslint-disable-next-line no-restricted-syntax -- a day key the save holds, empty when unset
  dayKey: dayKey === "" ? undefined : Temporal.Instant.from(dayKey),
});
