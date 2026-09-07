import type { z } from "zod";

import { roomIdsSchema } from "@esposter/db-schema";

// The rooms a client subscribes to at once — a subscription with no room to watch has nothing to yield. The
// Direct-message participants read takes the same list, which is why it lives here rather than in either router
export const roomIdsInputSchema = roomIdsSchema.shape.roomIds.min(1);
export type RoomIdsInput = z.infer<typeof roomIdsInputSchema>;
