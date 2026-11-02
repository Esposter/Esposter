import { MimeType } from "#shared/models/file/MimeType";
import { pluralize } from "#shared/util/text/pluralize";
import { WhiteboardExportFormat } from "@/models/whiteboard/WhiteboardExportFormat";
import { sanitizeFilename } from "@/services/app/sanitizeFilename";
import { rasterizeSvg } from "@/services/capture/rasterizeSvg";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { getWhiteboardImageUrls } from "@/services/whiteboard/export/getWhiteboardImageUrls";
import { useAlertStore } from "@/store/alert";
import { useResourceStore } from "@/store/resource";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { downloadFile, getResultAsync, noop } from "@esposter/shared";
import { getExportBounds, PositionedElementType, toPositionedSvg } from "headless-block-editor";

// The whiteboard as the editor holds it, downloaded as an SVG or a PNG drawn from the same SVG. Both come from the model, so the
// File matches what the canvas shows, and nothing is captured from the page
export const exportWhiteboard = async (format: WhiteboardExportFormat) => {
  const resourceStore = useResourceStore();
  const { resource } = resourceStore;
  if (!resource) return;

  const whiteboardStore = useWhiteboardStore();
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const fileName = sanitizeFilename(resource.name);
  await getResultAsync(async () => {
    await whiteboardStore.loadContent();
    const savedDocument = whiteboardStore.editState.document;
    const { failedFileIds, imageUrls } = await getWhiteboardImageUrls(savedDocument, resource.id);
    // An image that could not be loaded is left out with its element, so neither file draws it, and the owner is told how many
    const positionedDocument = {
      ...savedDocument,
      elements: savedDocument.elements.filter(
        (element) => element.type !== PositionedElementType.Image || !failedFileIds.includes(element.fileId),
      ),
    };
    if (failedFileIds.length > 0)
      createAlert(
        `${failedFileIds.length} ${pluralize("image", failedFileIds.length)} could not be loaded and left out of the export`,
        "warning",
      );
    const svg = toPositionedSvg(positionedDocument, (fileId) => imageUrls.get(fileId) ?? "");
    if (format === WhiteboardExportFormat.Svg) {
      downloadFile(`${fileName}.svg`, svg, MimeType.Svg);
      return;
    }
    const { height, width } = getExportBounds(positionedDocument);
    const png = await rasterizeSvg(new Blob([svg], { type: MimeType.Svg }), width, height);
    downloadFile(`${fileName}.png`, png, MimeType.Png);
  }).match(noop, (error) => {
    createErrorAlert(error);
  });
};
