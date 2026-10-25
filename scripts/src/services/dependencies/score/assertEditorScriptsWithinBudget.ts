import { EDITOR_SCRIPT_BUDGET } from "@esposter/configuration";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Throws over every editor whose gzipped script is past the budget, so the check that runs it fails and holds the merge
export const assertEditorScriptsWithinBudget = (bytesByEditor: Record<string, number>): void => {
  for (const [editor, bytes] of Object.entries(bytesByEditor))
    if (bytes > EDITOR_SCRIPT_BUDGET)
      throw new InvalidOperationError(
        Operation.Update,
        editor,
        `its script is ${bytes} bytes gzipped, over the ${EDITOR_SCRIPT_BUDGET} byte budget`,
      );
};
