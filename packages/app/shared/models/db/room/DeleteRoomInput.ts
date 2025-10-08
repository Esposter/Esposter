import type { z } from "zod";

import { selectRoomSchema } from "@esposter/db";

export const deleteRoomInputSchema = selectRoomSchema.shape.id;
export type DeleteRoomInput = z.infer<typeof deleteRoomInputSchema>;
