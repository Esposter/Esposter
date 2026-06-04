import { selectRoomInMessageSchema } from "@/schema/roomsInMessage";
import { createUniqueArraySchema, MAX_READ_LIMIT } from "@esposter/shared";
import { z } from "zod";

export const roomIdsSchema = z.object({
  roomIds: createUniqueArraySchema(selectRoomInMessageSchema.shape.id).max(MAX_READ_LIMIT),
});
