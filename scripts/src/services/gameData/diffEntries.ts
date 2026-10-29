import type { EntryDiff } from "#src/models/gameData/EntryDiff";

// The names one side holds and the other lacks, counted, and each name both hold under another hash
export const diffEntries = (before: Record<string, string>, after: Record<string, string>): EntryDiff => {
  const diff: EntryDiff = { addedCount: 0, changes: [], removedCount: 0 };
  for (const name of new Set([...Object.keys(before), ...Object.keys(after)])) {
    const beforeHash = before[name];
    const afterHash = after[name];
    if (beforeHash === afterHash) continue;
    else if (beforeHash === undefined) diff.addedCount++;
    else if (afterHash === undefined) diff.removedCount++;
    else diff.changes.push({ afterHash, beforeHash, name });
  }
  return diff;
};
