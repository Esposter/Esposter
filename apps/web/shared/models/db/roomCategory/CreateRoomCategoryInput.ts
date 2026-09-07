import type { z } from "zod";

import { selectRoomCategoryInMessageSchema } from "@esposter/db-schema";

export const createRoomCategoryInputSchema = selectRoomCategoryInMessageSchema.pick({ name: true });
export type CreateRoomCategoryInput = z.infer<typeof createRoomCategoryInputSchema>;
