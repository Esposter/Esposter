import type { Draft } from "@/models/message/Draft";

import { DRAFT_KEY_PREFIX } from "@/services/message/draft/constants";
import { getIsServer, getResult } from "@esposter/shared";

export const getDraft = (roomId: string): Draft | undefined => {
  if (getIsServer()) return undefined;
  const value = localStorage.getItem(`${DRAFT_KEY_PREFIX}${roomId}`);
  if (!value) return undefined;
  const parsed = getResult(() => JSON.parse(value) as unknown).unwrapOr(undefined);
  if (parsed && typeof parsed === "object" && "content" in parsed && "updatedAt" in parsed)
    return { content: String(parsed.content), updatedAt: new Date(String(parsed.updatedAt)) };
  // Legacy drafts were persisted as a raw HTML string rather than a serialized Draft.
  return { content: value, updatedAt: new Date() };
};
