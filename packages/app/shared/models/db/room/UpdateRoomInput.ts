import { refineRoomSchema, selectRoomInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const updateRoomInputSchema = refineRoomSchema(
  selectRoomInMessageSchema
    .pick({
      allowedMimeCategories: true,
      categoryId: true,
      id: true,
      image: true,
      isInvitePaused: true,
      isReadOnly: true,
      maxFileSizeBytes: true,
      name: true,
      slowmodeMs: true,
      topic: true,
    })
    .partial({
      allowedMimeCategories: true,
      categoryId: true,
      image: true,
      isInvitePaused: true,
      isReadOnly: true,
      maxFileSizeBytes: true,
      name: true,
      slowmodeMs: true,
      topic: true,
    }),
);
export type UpdateRoomInput = z.infer<typeof updateRoomInputSchema>;
