import { refineAtLeastOne } from "#src/services/zod/refineAtLeastOne";
import { refineRoomSchema } from "#src/services/room/refineRoomSchema";
import { selectRoomInMessageSchema } from "#src/schema/message/roomsInMessage";
import { z } from "zod";

const updatableRoomSchema = selectRoomInMessageSchema.pick({
  allowedMimeCategories: true,
  image: true,
  isInvitePaused: true,
  isReadOnly: true,
  maxFileSizeBytes: true,
  name: true,
  slowmodeMs: true,
  topic: true,
});

export const updateRoomInputSchema = refineAtLeastOne(
  refineRoomSchema(
    z.object({ ...selectRoomInMessageSchema.pick({ id: true }).shape, ...updatableRoomSchema.partial().shape }),
  ),
  updatableRoomSchema.keyof().options,
);
export type UpdateRoomInput = z.infer<typeof updateRoomInputSchema>;
