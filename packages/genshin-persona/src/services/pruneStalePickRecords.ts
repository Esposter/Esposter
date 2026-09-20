import type { PickRecord } from "#src/models/PickRecord";

import { PICK_RETENTION_DAYS } from "#src/services/constants";
import { getDaysBetween } from "#src/services/getDaysBetween";

export const pruneStalePickRecords = (records: PickRecord[], todayIsoDate: string): PickRecord[] =>
  records.filter(({ isoDate }) => getDaysBetween(isoDate, todayIsoDate) <= PICK_RETENTION_DAYS);
