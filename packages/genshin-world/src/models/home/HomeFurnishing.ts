import { z } from "zod";

// One furnishing by its item id: the load it takes up in the area it is placed in, zero for one that takes none
export interface HomeFurnishing {
  itemId: number;
  load: number;
}

export const homeFurnishingSchema = z.object({
  itemId: z.int().positive(),
  load: z.int().nonnegative(),
}) satisfies z.ZodType<HomeFurnishing>;
