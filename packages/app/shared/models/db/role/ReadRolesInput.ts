import { roomIdsSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readRolesInputSchema = z.object({
  roomIds: roomIdsSchema.shape.roomIds.min(1),
});
export type ReadRolesInput = z.infer<typeof readRolesInputSchema>;
