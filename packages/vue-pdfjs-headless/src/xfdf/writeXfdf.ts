import type { PdfFreeText } from "#src/models/PdfFreeText";

// XFDF is XML, so the characters XML reserves are escaped in the text and the names that go into it
const escapeXml = (text: string) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

// Writes free-text annotations as XFDF, one freetext element each, its page zero-based as XFDF counts pages
export const writeXfdf = (freeTexts: PdfFreeText[]): string => {
  const annotations = freeTexts
    .map(
      ({ contents, id, pageNumber, rect }) =>
        `<freetext name="${escapeXml(id)}" page="${pageNumber - 1}" rect="${rect.join(",")}"><contents>${escapeXml(contents)}</contents></freetext>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve"><annots>${annotations}</annots></xfdf>`;
};
