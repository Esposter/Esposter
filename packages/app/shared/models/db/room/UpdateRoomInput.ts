import type { z } from "zod/v4";

import { selectRoomSchema } from "#shared/db/schema/rooms";

export const updateRoomInputSchema = selectRoomSchema
  .pick({ id: true })
  // @TODO: oneOf([name])
  .extend(selectRoomSchema.pick({ name: true }).partial());
export type UpdateRoomInput = z.infer<typeof updateRoomInputSchema>;
