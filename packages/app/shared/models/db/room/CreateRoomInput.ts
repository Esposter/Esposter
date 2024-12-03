import type { z } from "zod";

import { selectRoomSchema } from "#shared/db/schema/rooms";

export const createRoomInputSchema = selectRoomSchema.pick({ name: true });
export type CreateRoomInput = z.infer<typeof createRoomInputSchema>;
