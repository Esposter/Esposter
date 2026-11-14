import type { MessageInMessage, StandardCreateMessageInput } from "@esposter/db-schema";

// The row a send holds before the server answers: what the server stores, under the id and timestamps this client gives
// it until the answer replaces them. Its defaults are the row's own, since nothing else fills them in. The loading flag
// is the send's to add, on the bubble it renders
export const createOptimisticMessage = (input: StandardCreateMessageInput, userId: string): MessageInMessage => {
  const now = new Date();
  return {
    appUserId: null,
    appUserImage: "",
    createdAt: now,
    deletedAt: null,
    filenames: "",
    files: input.files ?? [],
    id: crypto.randomUUID(),
    isEdited: false,
    isForward: false,
    isPinned: false,
    linkPreviewResponse: null,
    mentions: [],
    message: input.message || "",
    replyToId: input.replyToId || null,
    roomId: input.roomId,
    senderName: null,
    type: input.type,
    updatedAt: now,
    userId,
  };
};
