import type { DiffComment } from "@/models/agentConsole/DiffComment";

// The one key a line's comment is held under, so a line is found from the row it is drawn on
export const toDiffCommentKey = ({
  filePath,
  lineNumber,
  side,
}: Pick<DiffComment, "filePath" | "lineNumber" | "side">) => `${side}:${lineNumber}:${filePath}`;
