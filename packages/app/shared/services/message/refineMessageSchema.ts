import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { z } from "zod";

export const refineMessageSchema = <T extends z.ZodType<Partial<Pick<MessageEntity, "files" | "message">>>>(
  schema: T,
) => schema.refine(({ files, message }) => files !== undefined || message !== undefined);
