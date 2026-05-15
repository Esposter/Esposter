import { selectRoomInMessageSchema, standardMessageEntitySchema } from "@esposter/db-schema";
import { z } from "zod";

import { MAX_READ_LIMIT } from "#shared/services/pagination/constants";

export const readMetadataInputSchema = z.object({
  messageRowKeys: standardMessageEntitySchema.shape.rowKey.array().min(1).max(MAX_READ_LIMIT),
  roomId: selectRoomInMessageSchema.shape.id,
});
export type ReadMetadataInput = z.infer<typeof readMetadataInputSchema>;
