import type { z } from "zod";

import { selectInviteSchema } from "@esposter/db-schema";

export const joinRoomInputSchema = selectInviteSchema.shape.code;
export type JoinRoomInput = z.infer<typeof joinRoomInputSchema>;
