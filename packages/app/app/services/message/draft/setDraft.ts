import type { Draft } from "@/models/message/Draft";

import { DRAFT_KEY_PREFIX } from "@/services/message/draft/constants";
import { sanitizeMessageHtml } from "@/services/sanitizeHtml/sanitizeMessageHtml";

export const setDraft = (roomId: string, content: string): Draft => {
  const draft: Draft = { content: sanitizeMessageHtml(content), updatedAt: new Date() };
  localStorage.setItem(`${DRAFT_KEY_PREFIX}${roomId}`, JSON.stringify(draft));
  return draft;
};
