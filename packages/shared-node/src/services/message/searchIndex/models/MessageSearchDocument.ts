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

// Azure Table stores array columns JSON-stringified (serializeEntity), so raw REST rows carry strings that
// Must parse back into the collection shapes the search index expects (Collection(Edm.ComplexType/String)).
export const messageSearchDocumentSchema: z.ZodObject<{
  createdAt: z.ZodOptional<z.ZodString>;
  deletedAt: z.ZodOptional<z.ZodString>;
  files: z.ZodOptional<
    z.ZodPipe<
      z.ZodPipe<z.ZodString, z.ZodTransform<unknown, string>>,
      z.ZodArray<z.ZodObject<{ filename: z.ZodString; id: z.ZodString; mimetype: z.ZodString; size: z.ZodNumber }>>
    >
  >;
  isEdited: z.ZodOptional<z.ZodBoolean>;
  isForward: z.ZodOptional<z.ZodBoolean>;
  isPinned: z.ZodOptional<z.ZodBoolean>;
  linkPreviewResponse: z.ZodOptional<z.ZodString>;
  mentions: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<unknown, string>>, z.ZodArray<z.ZodString>>>;
  message: z.ZodOptional<z.ZodString>;
  PartitionKey: z.ZodString;
  replyRowKey: z.ZodOptional<z.ZodString>;
  RowKey: z.ZodString;
  type: z.ZodOptional<z.ZodString>;
  updatedAt: z.ZodOptional<z.ZodString>;
  userId: z.ZodOptional<z.ZodString>;
}> = z.object({
  createdAt: z.string().optional(),
  deletedAt: z.string().optional(),
  files: z
    .string()
    .transform((files) => JSON.parse(files) as unknown)
    .pipe(z.array(z.object({ filename: z.string(), id: z.string(), mimetype: z.string(), size: z.number() })))
    .optional(),
  isEdited: z.boolean().optional(),
  isForward: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  linkPreviewResponse: z.string().optional(),
  mentions: z
    .string()
    .transform((mentions) => JSON.parse(mentions) as unknown)
    .pipe(z.array(z.string()))
    .optional(),
  message: z.string().optional(),
  PartitionKey: z.string(),
  replyRowKey: z.string().optional(),
  RowKey: z.string(),
  type: z.string().optional(),
  updatedAt: z.string().optional(),
  userId: z.string().optional(),
}) satisfies z.ZodType<MessageSearchDocument>;
