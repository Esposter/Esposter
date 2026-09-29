import { selectRoomInMessageSchema } from "#src/schema/message/roomsInMessage";
import { z } from "zod";

export const roomIdSchema = z.object({ roomId: selectRoomInMessageSchema.shape.id });
