import type { z } from "zod";

import { selectRoomCategorySchema } from "@esposter/db-schema";

export const createRoomCategoryInputSchema = selectRoomCategorySchema.pick({ name: true });
export type CreateRoomCategoryInput = z.infer<typeof createRoomCategoryInputSchema>;
