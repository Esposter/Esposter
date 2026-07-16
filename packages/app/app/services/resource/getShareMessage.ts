import { escapeHtml } from "@/util/text/escapeHtml";
import { normalizeString } from "@esposter/shared";

// Message bodies are sanitized HTML rendered through v-html and nothing autolinks bare text, so the share
// Builds the anchor itself; the sanitizer allowlists a[href|rel|target]. A blank note just sends the link
export const getShareMessage = (note: string, url: string) => {
  const escapedUrl = escapeHtml(url);
  const link = `<p><a href="${escapedUrl}" rel="noopener noreferrer" target="_blank">${escapedUrl}</a></p>`;
  const normalizedNote = normalizeString(note);
  return normalizedNote ? `<p>${escapeHtml(normalizedNote).replaceAll("\n", "<br />")}</p>${link}` : link;
};
