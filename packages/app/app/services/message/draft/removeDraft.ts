import { DRAFT_KEY_PREFIX } from "@/services/message/draft/constants";

export const removeDraft = (roomId: string) => {
  localStorage.removeItem(`${DRAFT_KEY_PREFIX}${roomId}`);
};
