import type { PickRecord } from "#src/models/PickRecord";

import { PICK_RECORD_SEPARATOR, PICK_RECORDS_PATH } from "#src/services/constants";
import { writeStateFile } from "#src/services/writeStateFile";

export const writePickRecords = (records: PickRecord[]): void => {
  const lines = records.map(({ isoDate, name, sessionId }) => [sessionId, isoDate, name].join(PICK_RECORD_SEPARATOR));
  writeStateFile(PICK_RECORDS_PATH, lines.join("\n"));
};
