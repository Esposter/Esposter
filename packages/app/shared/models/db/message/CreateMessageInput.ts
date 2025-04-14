import { selectRoomSchema } from "#shared/db/schema/rooms";
import { messageEntitySchema } from "#shared/models/db/message/MessageEntity";
import { z } from "zod";

export const createMessageInputSchema = messageEntitySchema
  .pick({ message: true })
  .extend(z.interface({ roomId: selectRoomSchema.shape.id }));
export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;
