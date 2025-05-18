import type { z } from "zod";

import { selectRoomSchema } from "#shared/db/schema/rooms";

export const updateRoomInputSchema = selectRoomSchema
  .pick({ id: true })
  // @TODO: oneOf([name])
  .merge(selectRoomSchema.pick({ name: true }).partial());
export type UpdateRoomInput = z.infer<typeof updateRoomInputSchema>;
