import type { FileEdit } from "@/models/agentConsole/FileEdit";
// Every edit to one file replayed in order over its text before the session changed it, as one edit from where the
// File started to where it is now. A replaced text the replay cannot find — the file was changed outside the
// Session in between — leaves nothing to merge, and the edits are shown one by one instead
export const toMergedFileEdit = (
  filePath: string,
  originalText: string,
  fileEdits: FileEdit[],
): FileEdit | undefined => {
  // The tools match the model's line endings to the file's, so the replay reads the file the way the model wrote
  const normalizedOriginalText = originalText.replaceAll("\r\n", "\n");
  let text = normalizedOriginalText;

  for (const { isReplaceAll, newText, oldText } of fileEdits)
    // An edit that replaces nothing wrote the whole file
    if (!oldText) text = newText;
    else if (text.includes(oldText))
      text = isReplaceAll ? text.replaceAll(oldText, () => newText) : text.replace(oldText, () => newText);
    // A function never reads `$&` and its kin in the new text as replacement patterns
    else return undefined;

  return { filePath, id: filePath, isReplaceAll: false, newText: text, oldText: normalizedOriginalText };
};
