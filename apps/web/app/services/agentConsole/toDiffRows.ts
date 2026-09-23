import type { DiffRow } from "@/models/agentConsole/DiffRow";

import { DiffRowType } from "@/models/agentConsole/DiffRowType";
import { diffArrays } from "diff";
// Two texts as side-by-side rows. A removed run beside the added run that follows it pairs up line by line as
// Changed, which is what lets a reader see an edit as one line becoming another rather than a delete and an insert
export const toDiffRows = (oldText: string, newText: string): DiffRow[] => {
  const changes = diffArrays(oldText ? oldText.split("\n") : [], newText ? newText.split("\n") : []);
  const rows: DiffRow[] = [];

  for (const [index, change] of changes.entries()) {
    if (change.added && changes[index - 1]?.removed) continue;

    if (change.removed) {
      const addedLines = changes[index + 1]?.added ? (changes[index + 1]?.value ?? []) : [];
      const length = Math.max(change.value.length, addedLines.length);
      for (let lineIndex = 0; lineIndex < length; lineIndex++) {
        const oldLine = change.value[lineIndex];
        const newLine = addedLines[lineIndex];
        rows.push({
          newLine: newLine ?? "",
          oldLine: oldLine ?? "",
          type:
            oldLine === undefined
              ? DiffRowType.Added
              : newLine === undefined
                ? DiffRowType.Removed
                : DiffRowType.Changed,
        });
      }
    } else if (change.added)
      rows.push(...change.value.map((line) => ({ newLine: line, oldLine: "", type: DiffRowType.Added })));
    else rows.push(...change.value.map((line) => ({ newLine: line, oldLine: line, type: DiffRowType.Unchanged })));
  }

  return rows;
};
