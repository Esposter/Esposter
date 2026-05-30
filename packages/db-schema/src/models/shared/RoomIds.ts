import { selectRoomInMessageSchema } from "@/schema/roomsInMessage";
import { MAX_READ_LIMIT } from "@esposter/shared";
import { z } from "zod";

export const roomIdsSchema = z.object({
  roomIds: selectRoomInMessageSchema.shape.id.array().max(MAX_READ_LIMIT),
});
