import type { WardRecord } from "../../../types";

import { checkIsWardRecords } from "./checkIsWardRecords";

// A file that is not the shape the ward wrote holds no records, the same as a file that does not yet exist
export const parseRecords = (text: string): Record<string, WardRecord> => {
  // oxlint-disable-next-line no-restricted-properties -- The records hold numbers and ids, no date, and a mod cannot import the shared reviver
  const records: unknown = JSON.parse(text);
  return checkIsWardRecords(records) ? records : {};
};
