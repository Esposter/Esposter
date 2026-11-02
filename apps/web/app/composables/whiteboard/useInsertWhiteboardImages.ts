import { NOTE_IMAGE_MIME_TYPES } from "#shared/services/resource/note/constants";
import { getSha256Hex } from "@/services/shared/getSha256Hex";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { createWhiteboardImageElement } from "@/services/whiteboard/createWhiteboardImageElement";
import { WHITEBOARD_IMAGE_INSERT_OFFSET } from "@/services/whiteboard/palette/constants";
import { useResourceStore } from "@/store/resource";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { ResourceType } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

// Places pasted image files on a whiteboard. Each file is uploaded as a file asset of the whiteboard, and the element it places holds
// The file's id and none of its bytes, centred where the canvas is. An upload the server refuses alerts and places nothing, and the other
// Images still go in
export const useInsertWhiteboardImages = () => {
  const resourceStore = useResourceStore();
  const { currentResourceId } = storeToRefs(resourceStore);
  const uploadFile = useUploadResourceFile(ResourceType.Whiteboard, () => currentResourceId.value);
  const whiteboardStore = useWhiteboardStore();
  const { insertElement } = whiteboardStore;
  const whiteboardEditorStore = useWhiteboardEditorStore();
  const { getCentrePoint } = whiteboardEditorStore;
  return async (files: File[]) => {
    const imageFiles = files.filter((file) => NOTE_IMAGE_MIME_TYPES.includes(file.type));
    const uploadResults = await Promise.all(
      imageFiles.map(async (imageFile) => {
        // The file is addressed by the hash of its bytes, the id the element holds
        const fileId = await getSha256Hex(new Uint8Array(await imageFile.arrayBuffer()));
        const uploadResult = await getResultAsync(() => uploadFile(imageFile, fileId));
        return uploadResult.map(() => fileId);
      }),
    );
    const centre = getCentrePoint();
    // Inserted in the order they were picked, so the element list and the stacking follow it
    for (const [index, uploadResult] of uploadResults.entries())
      uploadResult.match(
        (fileId) => {
          const offset = index * WHITEBOARD_IMAGE_INSERT_OFFSET;
          insertElement(createWhiteboardImageElement(fileId, { x: centre.x + offset, y: centre.y + offset }));
        },
        (error) => {
          createErrorAlert(error);
        },
      );
  };
};
