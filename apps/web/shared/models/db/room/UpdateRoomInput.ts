import { refineAtLeastOne } from "#shared/services/zod/refineAtLeastOne";
import { refineRoomSchema, selectRoomInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

const updatableRoomSchema = selectRoomInMessageSchema.pick({
  allowedMimeCategories: true,
  categoryId: true,
  image: true,
  isInvitePaused: true,
  isReadOnly: true,
  maxFileSizeBytes: true,
  name: true,
  slowmodeMs: true,
  topic: true,
});

export const updateRoomInputSchema = refineAtLeastOne(
  refineRoomSchema(
    z.object({
      ...selectRoomInMessageSchema.pick({ id: true }).shape,
      ...updatableRoomSchema.partial().shape,
    }),
  ),
  updatableRoomSchema.keyof().options,
);
export type UpdateRoomInput = z.infer<typeof updateRoomInputSchema>;
