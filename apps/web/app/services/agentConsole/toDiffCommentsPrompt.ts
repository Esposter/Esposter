import type { DiffComment } from "@/models/agentConsole/DiffComment";

import { DiffSide } from "@/models/agentConsole/DiffSide";

// Each comment as its line's `path:line`, the line quoted and the comment under it. A line removed names its line
// In the file as it stood before the change, which is marked so the line is not taken for one still there
export const toDiffCommentsPrompt = (diffComments: DiffComment[]) =>
  diffComments
    .map(({ filePath, lineNumber, lineText, side, text }) =>
      [`${filePath}:${lineNumber}${side === DiffSide.Old ? " (removed)" : ""}`, `> ${lineText}`, text].join("\n"),
    )
    .join("\n\n");
