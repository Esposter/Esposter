import type { z } from "zod";

import { selectRoomSchema } from "@esposter/db-schema";

export const hideDirectMessageInputSchema = selectRoomSchema.shape.id;
export type HideDirectMessageInput = z.infer<typeof hideDirectMessageInputSchema>;
