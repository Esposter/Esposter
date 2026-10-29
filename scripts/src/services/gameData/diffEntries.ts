import type { EntryDiff } from "#src/models/gameData/EntryDiff";

// The names one side holds and the other lacks, counted, and each name both hold under another hash
export const diffEntries = (before: Record<string, string>, after: Record<string, string>): EntryDiff => {
  const diff: EntryDiff = { addedCount: 0, changes: [], removedCount: 0 };
  for (const name of new Set([...Object.keys(before), ...Object.keys(after)])) {
    // An own check, since an inherited member such as `constructor` is not a hash the side holds
    const beforeHash = Object.hasOwn(before, name) ? before[name] : undefined;
    const afterHash = Object.hasOwn(after, name) ? after[name] : undefined;
    if (beforeHash === afterHash) continue;
    else if (beforeHash === undefined) diff.addedCount++;
    else if (afterHash === undefined) diff.removedCount++;
    else diff.changes.push({ afterHash, beforeHash, name });
  }
  return diff;
};
