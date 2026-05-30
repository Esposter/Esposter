import { MAX_READ_LIMIT } from "@esposter/shared";
import { selectRoomInMessageSchema } from "@/schema/roomsInMessage";
import { z } from "zod";

export const roomIdsSchema = z.object({
  roomIds: selectRoomInMessageSchema.shape.id.array().max(MAX_READ_LIMIT),
});
