import type { Editor } from "grapesjs";

import { readEmailPreviewText } from "@/services/emailEditor/readEmailPreviewText";
import { writeEmailPreviewText } from "@/services/emailEditor/writeEmailPreviewText";

// The preview text lives in the email's MJML, so the field reads it back after every change — an undo included
export const useEmailPreviewText = (editor: Ref<Editor | undefined>) => {
  const previewText = ref("");
  watchImmediate(editor, (newEditor, _oldEditor, onCleanup) => {
    if (!newEditor) return;
    const readPreviewText = () => {
      previewText.value = readEmailPreviewText(newEditor);
    };
    readPreviewText();
    newEditor.on("update", readPreviewText);
    onCleanup(() => newEditor.off("update", readPreviewText));
  });
  const setPreviewText = (newPreviewText: string) => {
    previewText.value = newPreviewText;
    if (editor.value) writeEmailPreviewText(editor.value, newPreviewText);
  };

  return { previewText, setPreviewText };
};
