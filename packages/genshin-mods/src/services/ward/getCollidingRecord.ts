import type { WardRecord } from "../../../types";

import { WARD_WINDOW_MS } from "../constants";

// Another session's edit inside the window is the one record that asks; a session's own edits never do
export const getCollidingRecord = (
  record: undefined | WardRecord,
  sessionId: string,
  now: number,
): undefined | WardRecord =>
  record && record.sessionId !== sessionId && now - record.editedAt < WARD_WINDOW_MS ? record : undefined;
