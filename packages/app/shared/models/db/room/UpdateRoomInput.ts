import type { z } from "zod";

import { selectRoomInMessageSchema } from "@esposter/db-schema";

export const updateRoomInputSchema = selectRoomInMessageSchema
  .pick({ categoryId: true, id: true, image: true, isReadOnly: true, name: true, slowmodeMs: true, topic: true })
  .partial({ categoryId: true, image: true, isReadOnly: true, name: true, slowmodeMs: true, topic: true });
export type UpdateRoomInput = z.infer<typeof updateRoomInputSchema>;
