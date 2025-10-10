import type { z } from "zod";

import { selectRoomSchema } from "@esposter/db-schema";

export const createRoomInputSchema = selectRoomSchema.pick({ name: true });
export type CreateRoomInput = z.infer<typeof createRoomInputSchema>;
