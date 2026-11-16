import type { FileEntity, LinkPreviewResponse, MessageType } from "@esposter/db-schema";

// The fields a message is written from, whichever kind of sender wrote it
export interface MessageFields {
  appUserId?: string;
  appUserImage?: string;
  files?: FileEntity[] | undefined;
  isForward?: boolean | undefined;
  linkPreviewResponse?: LinkPreviewResponse | null | undefined;
  message: string;
  replyToId?: number | undefined;
  senderName?: string | undefined;
  type: MessageType;
  userId?: string;
  webhookDeliveryId?: string;
}
