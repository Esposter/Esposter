import type { z } from "zod";

import { selectRoomInMessageSchema } from "@esposter/db-schema";

export const hideDirectMessageInputSchema = selectRoomInMessageSchema.shape.id;
export type HideDirectMessageInput = z.infer<typeof hideDirectMessageInputSchema>;
