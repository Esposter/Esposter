import type { PdfFreeText } from "#src/models/PdfFreeText";

// XFDF is XML, so the characters XML reserves are escaped in the text and the names that go into it.
// XML 1.0 allows no control character but tab, newline and carriage return, and has no form for the others.
// Those are dropped from the text, since not even a reference to one is legal XML
const escapeXml = (text: string) =>
  text
    // oxlint-disable-next-line no-control-regex -- the control characters XML 1.0 forbids are what this drops
    .replaceAll(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/gu, "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

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
