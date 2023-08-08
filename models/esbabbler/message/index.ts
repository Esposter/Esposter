import { CompositeKeyEntity } from "@/models/azure";
import type { FileEntity } from "@/models/esbabbler/message/file";
import { fileSchema } from "@/models/esbabbler/message/file";
import { userSchema } from "@/server/trpc/routers/user";
import { MESSAGE_MAX_LENGTH } from "@/utils/validation";
import { z } from "zod";

export class MessageEntity extends CompositeKeyEntity {
  creatorId!: string;

  message!: string;

  files!: FileEntity[];

  createdAt!: Date;
}

export const messageSchema = z.object({
  // ${roomId}-${createdAt.format("yyyyMMdd")}
  partitionKey: z.string(),
  // reverse-ticked timestamp
  rowKey: z.string(),
  creatorId: userSchema.shape.id,
  message: z.string().min(1).max(MESSAGE_MAX_LENGTH),
  files: z.array(fileSchema),
  createdAt: z.date(),
}) satisfies z.ZodType<MessageEntity>;
