import type { RoomMessage } from "#src/models/realtime/RoomMessage";
import type { z } from "zod";

export const refineMessageSchema = <T extends z.ZodType<Partial<Pick<RoomMessage, "files" | "message">>>>(
  schema: T,
): T => schema.refine(({ files, message }) => files !== undefined || message !== undefined);
