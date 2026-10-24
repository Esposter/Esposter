import { getComposerTarget } from "@/services/message/composer/getComposerTarget";

// A thread's draft counts as the room's, because the room list is the only place either is surfaced: a reply
// Half-written in a thread pane is otherwise invisible until the drafts page is opened
export const checkHasRoomDraft = (composerKeys: string[], roomId: string) =>
  composerKeys.some((composerKey) => getComposerTarget(composerKey)?.roomId === roomId);
