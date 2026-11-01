import type { ReferenceFilePlan } from "#src/models/genshinParity/reference/ReferenceFilePlan";

import { planFromFixtureFolders } from "#src/services/genshinParity/reference/planFromFixtureFolders";

let referenceFiles: Promise<ReferenceFilePlan[]> | undefined;

// The committed file of every reference the map names, planned from the fixture folders and the map.
// The plan is read once per process, since neither changes during a command and every reference's lookup reads it.
// The components tree is walked once, not per reference.
export const readReferenceFiles = (): Promise<ReferenceFilePlan[]> => {
  referenceFiles ??= planFromFixtureFolders();
  return referenceFiles;
};
