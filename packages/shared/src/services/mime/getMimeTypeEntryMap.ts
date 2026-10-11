import type { MimeDatabaseEntry } from "#src/models/mime/MimeDatabaseEntry";

import mimeDatabase from "mime-db/db.json" with { type: "json" };

let mimeTypeEntryMap: ReadonlyMap<string, MimeDatabaseEntry> | undefined;

// The dataset is read on first use rather than at import, so a bundle that never reaches a lookup leaves it out
export const getMimeTypeEntryMap = (): ReadonlyMap<string, MimeDatabaseEntry> => {
  mimeTypeEntryMap ??= new Map(Object.entries<MimeDatabaseEntry>(mimeDatabase));
  return mimeTypeEntryMap;
};
