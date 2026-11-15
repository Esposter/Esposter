import type { FileEntity, LinkPreviewResponse, MessageType } from "@esposter/db-schema";

// The fields a message is written from, whichever kind of sender wrote it
export interface MessageFields {
  appUserId?: string;
  appUserImage?: string;
  files?: FileEntity[];
  isForward?: boolean;
  linkPreviewResponse?: LinkPreviewResponse | null;
  message: string;
  replyToId?: number;
  senderName?: string;
  type: MessageType;
  userId?: string;
  webhookDeliveryId?: string;
}
