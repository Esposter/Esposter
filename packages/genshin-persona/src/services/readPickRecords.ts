import type { PickRecord } from "#src/models/PickRecord";

import { PICK_RECORDS_PATH, STATE_FIELD_SEPARATOR } from "#src/services/constants";
import { existsSync, readFileSync } from "node:fs";

// One record per line, tab-separated: a shape that cannot fail to parse, so a damaged file loses a line rather
// Than the session's decoration. A record written before the element was kept reads back with none, so it keeps
// Its name and loses only its colour
export const readPickRecords = (): PickRecord[] => {
  if (!existsSync(PICK_RECORDS_PATH)) return [];

  return readFileSync(PICK_RECORDS_PATH, "utf8")
    .split("\n")
    .flatMap<PickRecord>((line) => {
      const [sessionId, isoDate, name, element = ""] = line.split(STATE_FIELD_SEPARATOR);
      return sessionId && isoDate && name ? [{ element, isoDate, name, sessionId }] : [];
    });
};
