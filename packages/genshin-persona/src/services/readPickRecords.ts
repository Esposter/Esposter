import type { PickRecord } from "#src/models/PickRecord";

import { PICK_RECORDS_PATH, STATE_FIELD_SEPARATOR } from "#src/services/constants";
import { existsSync, readFileSync } from "node:fs";

// One record per line, tab-separated: a shape that cannot fail to parse, so a damaged file loses a line rather
// Than the session's decoration. A record written before a field was kept reads back without it, so it keeps its
// Name and loses only its colour, and its name stands in for its own display
export const readPickRecords = (): PickRecord[] => {
  if (!existsSync(PICK_RECORDS_PATH)) return [];

  return readFileSync(PICK_RECORDS_PATH, "utf8")
    .split("\n")
    .flatMap<PickRecord>((line) => {
      const [sessionId, isoDate, name, element = "", displayName = ""] = line.split(STATE_FIELD_SEPARATOR);
      return sessionId && isoDate && name
        ? [{ displayName: displayName || name, element, isoDate, name, sessionId }]
        : [];
    });
};
