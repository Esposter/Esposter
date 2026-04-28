import type { z } from "zod";

import { selectRoomInMessageSchema } from "@esposter/db-schema";

export const updateRoomInputSchema = selectRoomInMessageSchema
  .pick({ categoryId: true, id: true, isReadOnly: true, name: true, topic: true })
  .partial({ categoryId: true, isReadOnly: true, name: true, topic: true });
export type UpdateRoomInput = z.infer<typeof updateRoomInputSchema>;
