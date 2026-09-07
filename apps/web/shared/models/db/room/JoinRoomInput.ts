import type { z } from "zod";

import { selectInviteInMessageSchema } from "@esposter/db-schema";

export const joinRoomInputSchema = selectInviteInMessageSchema.shape.id;
export type JoinRoomInput = z.infer<typeof joinRoomInputSchema>;
