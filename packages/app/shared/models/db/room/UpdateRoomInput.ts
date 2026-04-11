import type { z } from "zod";

import { selectRoomSchema } from "@esposter/db-schema";

export const updateRoomInputSchema = selectRoomSchema
  .pick({ categoryId: true, id: true, name: true })
  .partial({ categoryId: true, name: true });
export type UpdateRoomInput = z.infer<typeof updateRoomInputSchema>;
