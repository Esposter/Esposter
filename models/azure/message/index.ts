import { CompositeKeyEntity } from "@/models/azure";
import { FileEntity, fileSchema } from "@/models/azure/message/file";
import { MESSAGE_MAX_LENGTH } from "@/utils/validation";
// @NOTE: Fix class-transformer when decorator gets supported in nuxt 3
// import { Type } from "class-transformer";
import { userSchema } from "@/server/trpc/routers/user";
import type { toZod } from "tozod";
import { z } from "zod";

export class MessageEntity extends CompositeKeyEntity {
  creatorId!: string;

  message!: string;

  // @Type(() => FileEntity)
  files!: FileEntity[];

  createdAt!: Date;
}

export const messageSchema: toZod<MessageEntity> = z.object({
  // ${roomId}-${createdAt.format("yyyyMMdd")}
  partitionKey: z.string(),
  // reverse-ticked timestamp
  rowKey: z.string(),
  creatorId: userSchema.shape.id,
  message: z.string().min(1).max(MESSAGE_MAX_LENGTH),
  files: z.array(fileSchema),
  createdAt: z.date(),
});
