import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { renderWebpageDocument } from "#shared/services/pageBuilder/renderWebpageDocument";
import { sanitizeFilename } from "@/services/app/sanitizeFilename";
import { absolutizeResourceAssetUrls } from "@/services/resource/absolutizeResourceAssetUrls";
import { downloadFile } from "@esposter/shared";

// The page as the editor holds it, rendered in the browser by the same pure function the server bakes a published page
// with, and downloaded as one HTML file. The origin is the app's, which the caller reads from the window it runs in
export const exportWebpageHtml = (name: string, document: WebpageDocument, origin: string) => {
  const html = absolutizeResourceAssetUrls(renderWebpageDocument(document, { origin }), origin);
  downloadFile(`${sanitizeFilename(name)}.html`, html, "text/html");
};
