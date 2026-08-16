import type { Draft } from "@/models/message/Draft";

import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { sanitizeTextHtml } from "@esposter/shared";

// Keyed by composer, so a thread's reply is a draft of its own beside the room's message
export const setDraft = (composerKey: string, content: string): Draft => {
  const draft: Draft = { content: sanitizeTextHtml(content), updatedAt: new Date() };
  localStorage.setItem(LocalStorageKey.Draft(composerKey), JSON.stringify(draft));
  return draft;
};
