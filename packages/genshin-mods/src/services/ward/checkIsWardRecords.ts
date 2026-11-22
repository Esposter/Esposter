import type { WardRecord } from "../../../types";

import { checkIsObject } from "../checkIsObject";

// A record as the ward reads it: its edit time for the window and its session for the collision
const checkIsWardRecord = (value: unknown): value is WardRecord =>
  checkIsObject(value) && typeof value.editedAt === "number" && typeof value.sessionId === "string";

export const checkIsWardRecords = (value: unknown): value is Record<string, WardRecord> =>
  checkIsObject(value) && Object.values(value).every((record) => checkIsWardRecord(record));
