import { refineRoomSchema, selectRoomInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const updateRoomInputSchema = refineRoomSchema(
  selectRoomInMessageSchema
    .pick({ categoryId: true, id: true, image: true, isReadOnly: true, name: true, slowmodeMs: true, topic: true })
    .partial({ categoryId: true, image: true, isReadOnly: true, name: true, slowmodeMs: true, topic: true }),
);
export type UpdateRoomInput = z.infer<typeof updateRoomInputSchema>;
