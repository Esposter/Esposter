import type { MessageFields } from "#src/models/room/MessageFields";
import type { NewMessage } from "#src/models/room/NewMessage";

import { getFilenames } from "#src/services/room/getFilenames";
import { getMessageMentions } from "#src/services/room/getMessageMentions";

// The row a message is written as. Its mentions are read from its text here, so no caller can write a message whose
// Mentions disagree with its text
export const getMessageRow = (
  {
    appUserId,
    appUserImage = "",
    files = [],
    isForward = false,
    linkPreviewResponse = null,
    message,
    replyToId,
    senderName,
    type,
    userId,
    webhookDeliveryId,
  }: MessageFields,
  now: Date,
): NewMessage => ({
  appUserId: appUserId ?? null,
  appUserImage,
  createdAt: now,
  editedAt: null,
  filenames: getFilenames(files),
  files,
  isForward,
  isPinned: false,
  linkPreviewResponse,
  mentions: getMessageMentions(message, type),
  message,
  replyToId: replyToId ?? null,
  senderName: senderName ?? null,
  type,
  updatedAt: now,
  userId: userId ?? null,
  webhookDeliveryId: webhookDeliveryId ?? null,
});
