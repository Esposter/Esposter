import type { WardRecord } from "../../../types";

export const parseRecords = (text: string): Record<string, WardRecord> =>
  // oxlint-disable-next-line no-restricted-properties, typescript/no-unsafe-type-assertion -- The records hold numbers and ids, no date, and a mod cannot import the shared reviver; the plugin carries no schema library to check the file it wrote
  JSON.parse(text) as Record<string, WardRecord>;
