import type { WardRecord } from "../../../types";

export const parseRecords = (text: string): Record<string, WardRecord> =>
  // oxlint-disable-next-line no-restricted-properties -- The records hold numbers and ids, no date, and a mod cannot import the shared reviver
  JSON.parse(text) as Record<string, WardRecord>;
