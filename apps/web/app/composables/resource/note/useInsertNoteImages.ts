import type { Editor } from "@tiptap/core";

import { NOTE_IMAGE_MIME_TYPES } from "#shared/services/resource/note/constants";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { useResourceStore } from "@/store/resource";
import { ResourceType } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

// Adds picked, pasted or dropped image files to a note. Each file is uploaded before its image joins the document, so
// The node only ever names the stable asset url the upload returns, and the bytes never reach the document. An upload
// The server refuses alerts and adds nothing, and the other images still go in
export const useInsertNoteImages = () => {
  const resourceStore = useResourceStore();
  const { resource } = storeToRefs(resourceStore);
  const uploadFile = useUploadResourceFile(ResourceType.Note, () => resource.value?.id ?? "");
  return async (editor: Editor, files: File[], position?: number) => {
    const imageFiles = files.filter((file) => NOTE_IMAGE_MIME_TYPES.includes(file.type));
    const uploadResults = await Promise.all(imageFiles.map((file) => getResultAsync(() => uploadFile(file))));
    const chain = editor.chain().focus();
    if (position !== undefined) chain.setTextSelection(position);
    // Each image inserted at the selection leaves the caret after it, so the images keep the order they were picked in
    for (const uploadResult of uploadResults)
      uploadResult.match(
        (src) => chain.setImage({ src }),
        (error) => createErrorAlert(error),
      );
    chain.run();
  };
};
