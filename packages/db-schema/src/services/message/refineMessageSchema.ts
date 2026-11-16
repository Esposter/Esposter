import type { RoomMessage } from "#src/models/realtime/RoomMessage";
import type { UndefinedOnPartial } from "type-fest";
import type { z } from "zod";

// A schema's optional fields parse to `T | undefined`, so the constraint takes that shape
export const refineMessageSchema = <
  T extends z.ZodType<UndefinedOnPartial<Partial<Pick<RoomMessage, "files" | "message">>>>,
>(
  schema: T,
): T => schema.refine(({ files, message }) => files !== undefined || message !== undefined);
