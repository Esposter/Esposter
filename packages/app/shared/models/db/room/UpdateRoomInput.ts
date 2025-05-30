import { selectRoomSchema } from "#shared/db/schema/rooms";
import { z } from "zod/v4";

export const updateRoomInputSchema = z.object({
  ...selectRoomSchema.pick({ id: true }).shape,
  // @TODO: oneOf([name])
  ...selectRoomSchema.partial({ name: true }).shape,
});
export type UpdateRoomInput = z.infer<typeof updateRoomInputSchema>;
