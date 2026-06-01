import { roomIdsSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readMyPermissionsInputSchema = z.object({
  roomIds: roomIdsSchema.shape.roomIds.min(1),
});
export type ReadMyPermissionsInput = z.infer<typeof readMyPermissionsInputSchema>;
