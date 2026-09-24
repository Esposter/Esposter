import type { FileOriginTracker } from "#src/models/claudeAgentSdk/FileOriginTracker";

import { z } from "zod";
// What the edit and write tools report beside their result: the file, and its text before the call — none for a
// File the call created, or one too large for the tool to include
const fileEditResultSchema = z.object({
  filePath: z.string().min(1),
  originalFile: z.string().nullable(),
  type: z.enum(["create", "update"]).optional(),
});
// Each file's text before the session first changed it, passed on with that first change alone, so the page can
// Merge every change to a file into one diff without the whole file crossing the wire on every edit
export const createFileOriginTracker = (): FileOriginTracker => {
  const changedFilePaths = new Set<string>();

  return {
    readToolResult: (event, toolUseResult) => {
      const fileEditResult = fileEditResultSchema.safeParse(toolUseResult);
      if (event.isError || !fileEditResult.success) return event;

      const { filePath, originalFile, type } = fileEditResult.data;
      if (changedFilePaths.has(filePath)) return event;

      changedFilePaths.add(filePath);
      const originalText = originalFile ?? (type === "create" ? "" : undefined);
      return originalText === undefined ? event : { ...event, originalText };
    },
  };
};
