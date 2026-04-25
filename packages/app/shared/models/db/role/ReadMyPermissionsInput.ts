import { MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import { roomIdsSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readMyPermissionsInputSchema = z.object({
  roomIds: roomIdsSchema.shape.roomIds.min(1).max(MAX_READ_LIMIT),
});
export type ReadMyPermissionsInput = z.infer<typeof readMyPermissionsInputSchema>;
