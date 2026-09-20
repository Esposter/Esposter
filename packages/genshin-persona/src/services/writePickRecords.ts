import type { PickRecord } from "#src/models/PickRecord";

import { PICK_RECORDS_PATH, STATE_FIELD_SEPARATOR } from "#src/services/constants";
import { writeStateFile } from "#src/services/writeStateFile";

export const writePickRecords = (records: PickRecord[]): void => {
  const lines = records.map(({ element, isoDate, name, sessionId }) =>
    [sessionId, isoDate, name, element].join(STATE_FIELD_SEPARATOR),
  );
  writeStateFile(PICK_RECORDS_PATH, lines.join("\n"));
};
