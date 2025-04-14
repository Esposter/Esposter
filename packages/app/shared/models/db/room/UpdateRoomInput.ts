import type { z } from "zod";

import { selectRoomSchema } from "#shared/db/schema/rooms";

export const updateRoomInputSchema = selectRoomSchema.pick({ id: true, name: true }).partial({ name: true });
export type UpdateRoomInput = z.infer<typeof updateRoomInputSchema>;
