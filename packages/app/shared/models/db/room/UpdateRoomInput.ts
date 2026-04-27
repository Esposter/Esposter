import type { z } from "zod";

import { selectRoomInMessageSchema } from "@esposter/db-schema";

export const updateRoomInputSchema = selectRoomInMessageSchema
  .pick({ categoryId: true, id: true, name: true })
  .partial({ categoryId: true, name: true });
export type UpdateRoomInput = z.infer<typeof updateRoomInputSchema>;
