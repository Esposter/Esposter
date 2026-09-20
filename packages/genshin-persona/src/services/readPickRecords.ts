import type { PickRecord } from "#src/models/PickRecord";

import { PICK_RECORD_SEPARATOR, PICK_RECORDS_PATH } from "#src/services/constants";
import { existsSync, readFileSync } from "node:fs";

// One record per line, tab-separated: a shape that cannot fail to parse, so a damaged file loses a line rather
// Than the session's decoration
export const readPickRecords = (): PickRecord[] => {
  if (!existsSync(PICK_RECORDS_PATH)) return [];

  return readFileSync(PICK_RECORDS_PATH, "utf8")
    .split("\n")
    .flatMap<PickRecord>((line) => {
      const [sessionId, isoDate, name] = line.split(PICK_RECORD_SEPARATOR);
      return sessionId && isoDate && name ? [{ isoDate, name, sessionId }] : [];
    });
};
