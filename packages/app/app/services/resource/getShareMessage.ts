import { normalizeString } from "@esposter/shared";

// Plain text, deliberately: the message pipeline already turns a bare URL into a link preview from the view
// Page's OG tags, so a share never needs a message type of its own. A blank note just sends the link
export const getShareMessage = (note: string, url: string) => {
  const normalizedNote = normalizeString(note);
  return normalizedNote ? `${normalizedNote}\n${url}` : url;
};
