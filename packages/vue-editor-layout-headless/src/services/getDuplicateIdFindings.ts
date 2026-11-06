import type { Finding } from "#src/models/Finding";

import { FindingKind } from "#src/models/FindingKind";

// The finding for each id that more than one of the given ids names, once however many times it repeats
export const getDuplicateIdFindings = (ids: string[]): Finding[] => {
  const duplicateIds = new Set(ids.filter((id, index) => ids.indexOf(id) !== index));
  return Array.from(duplicateIds, (id) => ({ kind: FindingKind.DuplicateId, subject: id }));
};
