import { selectRoomInMessageSchema } from "#src/schema/message/roomsInMessage";
import { createUniquePrimitiveArraySchema, MAX_READ_LIMIT } from "@esposter/shared";
import { z } from "zod";

export const roomIdsSchema = z.object({
  roomIds: createUniquePrimitiveArraySchema(selectRoomInMessageSchema.shape.id).max(MAX_READ_LIMIT),
});
