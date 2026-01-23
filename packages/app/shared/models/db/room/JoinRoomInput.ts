import type { z } from "zod";

export const joinRoomInputSchema = selectInviteInMessageSchema.shape.code;
export type JoinRoomInput = z.infer<typeof joinRoomInputSchema>;
