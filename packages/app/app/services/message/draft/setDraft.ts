import type { Draft } from "@/models/message/Draft";

import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { sanitizeTextHtml } from "@esposter/shared";

export const setDraft = (roomId: string, content: string): Draft => {
  const draft: Draft = { content: sanitizeTextHtml(content), updatedAt: new Date() };
  localStorage.setItem(LocalStorageKey.Draft(roomId), JSON.stringify(draft));
  return draft;
};
