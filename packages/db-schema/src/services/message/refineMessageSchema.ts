import type { StandardMessageEntity } from "#src/models/message/StandardMessageEntity";
import type { z } from "zod";

export const refineMessageSchema = <T extends z.ZodType<Partial<Pick<StandardMessageEntity, "files" | "message">>>>(
  schema: T,
): T => schema.refine(({ files, message }) => files !== undefined || message !== undefined);
