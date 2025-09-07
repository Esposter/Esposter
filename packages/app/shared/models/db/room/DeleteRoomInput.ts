import type { z } from "zod";

import { selectRoomSchema } from "#shared/db/schema/rooms";

export const deleteRoomInputSchema = selectRoomSchema.shape.id;
export type DeleteRoomInput = z.infer<typeof deleteRoomInputSchema>;
