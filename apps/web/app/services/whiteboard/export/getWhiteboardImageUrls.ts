import type { ResourceInResource } from "@esposter/db-schema";
import type { PositionedDocument } from "vue-block-editor-headless";

import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { getResourceFileBlobName } from "@esposter/db-schema";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { PositionedElementType } from "vue-block-editor-headless";

// Each image of a whiteboard as a data url, keyed by its file id, and the file ids of the images that could not be read. An export
// Is a file that stands alone, so its images are embedded rather than linked: a picture drawn from a link cannot load one in an
// Image the browser rasterises. One image that cannot be read leaves the others to load
export const getWhiteboardImageUrls = async (
  document: PositionedDocument,
  resourceId: ResourceInResource["id"],
): Promise<{ failedFileIds: string[]; imageUrls: Map<string, string> }> => {
  const fileIds = new Set(
    document.elements.flatMap((element) => (element.type === PositionedElementType.Image ? [element.fileId] : [])),
  );
  const imageUrls = new Map<string, string>();
  const failedFileIds: string[] = [];
  await Promise.all(
    Array.from(fileIds, (fileId) =>
      getResultAsync(async () => {
        const response = await fetch(getResourceAssetUrl(getResourceFileBlobName(resourceId, fileId)));
        if (!response.ok)
          throw new InvalidOperationError(
            Operation.Read,
            getWhiteboardImageUrls.name,
            `image ${fileId} could not be read`,
          );
        const blob = await response.blob();
        const bytes = new Uint8Array(await blob.arrayBuffer());
        return `data:${blob.type};base64,${bytes.toBase64()}`;
      }).match(
        (dataUrl) => {
          imageUrls.set(fileId, dataUrl);
        },
        () => {
          failedFileIds.push(fileId);
        },
      ),
    ),
  );
  return { failedFileIds, imageUrls };
};
