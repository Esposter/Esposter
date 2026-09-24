import type { FileEdit } from "@/models/agentConsole/FileEdit";

import { EditToolName } from "@/models/agentConsole/EditToolName";
import { ID_SEPARATOR } from "@esposter/shared";
import { z } from "zod";

const editInputSchema = z.object({
  file_path: z.string(),
  new_string: z.string(),
  old_string: z.string(),
  replace_all: z.boolean().optional(),
});
const multiEditInputSchema = z.object({
  edits: z.object({ new_string: z.string(), old_string: z.string(), replace_all: z.boolean().optional() }).array(),
  file_path: z.string(),
});
const writeInputSchema = z.object({ content: z.string(), file_path: z.string() });
// What one edit tool call changes, read from its input — for a call on the timeline, and for one a permission card
// Is asking about before it runs. Any other tool changes no file this can show
export const toFileEdits = (name: string, input: Record<string, unknown>, id: string): FileEdit[] => {
  switch (name) {
    case EditToolName.Edit: {
      const editInput = editInputSchema.safeParse(input);
      return editInput.success
        ? [
            {
              filePath: editInput.data.file_path,
              id,
              isReplaceAll: Boolean(editInput.data.replace_all),
              newText: editInput.data.new_string,
              oldText: editInput.data.old_string,
            },
          ]
        : [];
    }
    case EditToolName.MultiEdit: {
      const multiEditInput = multiEditInputSchema.safeParse(input);
      return multiEditInput.success
        ? multiEditInput.data.edits.map((edit, index) => ({
            filePath: multiEditInput.data.file_path,
            id: `${id}${ID_SEPARATOR}${index}`,
            isReplaceAll: Boolean(edit.replace_all),
            newText: edit.new_string,
            oldText: edit.old_string,
          }))
        : [];
    }
    case EditToolName.Write: {
      const writeInput = writeInputSchema.safeParse(input);
      return writeInput.success
        ? [
            {
              filePath: writeInput.data.file_path,
              id,
              isReplaceAll: false,
              newText: writeInput.data.content,
              oldText: "",
            },
          ]
        : [];
    }
    default:
      return [];
  }
};
