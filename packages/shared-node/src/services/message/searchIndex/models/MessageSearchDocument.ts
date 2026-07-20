import { z } from "zod";

export interface MessageSearchDocument {
  createdAt?: string;
  deletedAt?: string;
  files?: { filename: string; id: string; mimetype: string; size: number }[];
  isEdited?: boolean;
  isForward?: boolean;
  isPinned?: boolean;
  linkPreviewResponse?: string;
  mentions?: string[];
  message?: string;
  PartitionKey: string;
  replyRowKey?: string;
  RowKey: string;
  type?: string;
  updatedAt?: string;
  userId?: string;
}

export const messageSearchDocumentSchema: z.ZodType<MessageSearchDocument> = z.object({
  createdAt: z.string().optional(),
  deletedAt: z.string().optional(),
  files: z.array(z.object({ filename: z.string(), id: z.string(), mimetype: z.string(), size: z.number() })).optional(),
  isEdited: z.boolean().optional(),
  isForward: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  linkPreviewResponse: z.string().optional(),
  mentions: z.array(z.string()).optional(),
  message: z.string().optional(),
  PartitionKey: z.string(),
  replyRowKey: z.string().optional(),
  RowKey: z.string(),
  type: z.string().optional(),
  updatedAt: z.string().optional(),
  userId: z.string().optional(),
});
