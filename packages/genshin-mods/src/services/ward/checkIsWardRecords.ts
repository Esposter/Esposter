import type { WardRecord } from "../../../types";

import { checkIsObject } from "../checkIsObject";
import { checkIsWardRecord } from "./checkIsWardRecord";

export const checkIsWardRecords = (value: unknown): value is Record<string, WardRecord> =>
  checkIsObject(value) && Object.values(value).every((record) => checkIsWardRecord(record));
