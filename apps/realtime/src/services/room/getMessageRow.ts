import type { MessageFields } from "#src/models/room/MessageFields";
import type { NewMessage } from "#src/models/room/NewMessage";

import { getFilenames } from "#src/services/room/getFilenames";

export const getMessageRow = (
  {
    appUserId,
    appUserImage = "",
    files = [],
    isForward = false,
    linkPreviewResponse = null,
    mentions = [],
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
  filenames: getFilenames(files),
  files,
  isEdited: false,
  isForward,
  isPinned: false,
  linkPreviewResponse,
  mentions,
  message,
  replyToId: replyToId ?? null,
  senderName: senderName ?? null,
  type,
  updatedAt: now,
  userId: userId ?? null,
  webhookDeliveryId: webhookDeliveryId ?? null,
});
