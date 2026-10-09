import type { DiffRow } from "@/models/agentConsole/DiffRow";

import { DiffRowType } from "@/models/agentConsole/DiffRowType";
import { DIFF_CONTEXT_LINE_COUNT } from "@/services/agentConsole/constants";
import { diffArrays } from "diff";

// Two texts as side-by-side rows. A removed run beside the added run that follows it pairs up line by line as
// Changed, which is what lets a reader see an edit as one line becoming another rather than a delete and an insert. An
// Unchanged run keeps its lines nearest a change and folds the rest into one row, so a whole file's diff reads as its
// Changes. Every line carries its number in its side's text, counted through the lines a fold hides
export const toDiffRows = (oldText: string, newText: string) => {
  const changes = diffArrays(oldText ? oldText.split("\n") : [], newText ? newText.split("\n") : []);
  const rows: DiffRow[] = [];
  let oldLineNumber = 0;
  let newLineNumber = 0;

  const pushUnchangedRows = (lines: string[]) => {
    for (const line of lines) {
      oldLineNumber++;
      newLineNumber++;
      rows.push({ newLine: line, newLineNumber, oldLine: line, oldLineNumber, type: DiffRowType.Unchanged });
    }
  };

  for (const [index, change] of changes.entries()) {
    if (change.added && changes[index - 1]?.removed) continue;

    if (change.removed) {
      const addedLines = changes[index + 1]?.added ? (changes[index + 1]?.value ?? []) : [];
      const length = Math.max(change.value.length, addedLines.length);
      for (let lineIndex = 0; lineIndex < length; lineIndex++) {
        const oldLine = change.value[lineIndex];
        const newLine = addedLines[lineIndex];
        if (oldLine !== undefined) oldLineNumber++;
        if (newLine !== undefined) newLineNumber++;
        rows.push({
          newLine: newLine ?? "",
          newLineNumber: newLine === undefined ? 0 : newLineNumber,
          oldLine: oldLine ?? "",
          oldLineNumber: oldLine === undefined ? 0 : oldLineNumber,
          type:
            oldLine === undefined
              ? DiffRowType.Added
              : newLine === undefined
                ? DiffRowType.Removed
                : DiffRowType.Changed,
        });
      }
    } else if (change.added)
      for (const line of change.value) {
        newLineNumber++;
        rows.push({ newLine: line, newLineNumber, oldLine: "", oldLineNumber: 0, type: DiffRowType.Added });
      }
    else {
      const keptBeforeCount = index === 0 ? 0 : DIFF_CONTEXT_LINE_COUNT;
      const keptAfterCount = index === changes.length - 1 ? 0 : DIFF_CONTEXT_LINE_COUNT;
      const collapsedCount = change.value.length - keptBeforeCount - keptAfterCount;
      // Folding a single line would hide nothing the fold row does not take the room of
      if (collapsedCount > 1) {
        const collapsedLabel = `⋯ ${collapsedCount} unchanged lines`;
        pushUnchangedRows(change.value.slice(0, keptBeforeCount));
        oldLineNumber += collapsedCount;
        newLineNumber += collapsedCount;
        rows.push({
          newLine: collapsedLabel,
          newLineNumber: 0,
          oldLine: collapsedLabel,
          oldLineNumber: 0,
          type: DiffRowType.Collapsed,
        });
        pushUnchangedRows(change.value.slice(change.value.length - keptAfterCount));
      } else pushUnchangedRows(change.value);
    }
  }

  return rows;
};
