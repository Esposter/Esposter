import type { z } from "zod";

import { selectInviteSchema } from "#shared/db/schema/invites";

export const joinRoomInputSchema = selectInviteSchema.shape.code;
export type JoinRoomInput = z.infer<typeof joinRoomInputSchema>;
