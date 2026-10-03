import type { WardRecord } from "../../../types";

import { WARD_WINDOW_MS } from "../constants";

// The edit recorded and every record past the window dropped, so the file holds the last half hour and no more
export const getRecordsWithEdit = (
  records: Record<string, WardRecord>,
  path: string,
  record: WardRecord,
): Record<string, WardRecord> => ({
  ...Object.fromEntries(
    Object.entries(records).filter(([, { editedAt }]) => record.editedAt - editedAt < WARD_WINDOW_MS),
  ),
  [path]: record,
});
