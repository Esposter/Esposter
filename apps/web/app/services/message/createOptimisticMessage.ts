import type { ClientMessage } from "@/models/message/ClientMessage";
import type { CreateMessageInput } from "#shared/models/db/message/CreateMessageInput";

// The optimistic bubble a send renders before the server answers, holding what the server stores under the timestamps
// this client gives it until the answer replaces them. The room has not assigned it an id yet, so it takes a negative
// one, which no room-assigned id can be, counted down so two sends in the same tick never share it. Its loading flag is
// the send's to add, on the bubble it renders
let optimisticMessageId = 0;
export const createOptimisticMessage = (input: CreateMessageInput, userId: string): ClientMessage => {
  const now = new Date();
  optimisticMessageId -= 1;
  return {
    appUserId: null,
    appUserImage: "",
    createdAt: now,
    deletedAt: null,
    files: input.files ?? [],
    id: optimisticMessageId,
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
