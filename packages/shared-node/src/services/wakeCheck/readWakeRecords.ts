import type { WakeRecord } from "#src/models/WakeRecord";

import { getWakeRecordDirectory } from "#src/services/wakeCheck/getWakeRecordDirectory";
import { jsonDateParse } from "@esposter/shared";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const readWakeRecords = (root: string): WakeRecord[] => {
  const directory = getWakeRecordDirectory(root);
  return existsSync(directory)
    ? readdirSync(directory).map((name) => jsonDateParse<WakeRecord>(readFileSync(join(directory, name), "utf8")))
    : [];
};
