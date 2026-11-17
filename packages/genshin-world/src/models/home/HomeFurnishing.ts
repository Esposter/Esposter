import { z } from "zod";

// One furnishing by its item id: the load its first copy takes up in the area it is placed in, and the reduced load each
// Further copy takes, both zero for a furnishing that takes none
export interface HomeFurnishing {
  discountLoad: number;
  itemId: number;
  load: number;
}

export const homeFurnishingSchema = z.object({
  discountLoad: z.int().nonnegative(),
  itemId: z.int().positive(),
  load: z.int().nonnegative(),
}) satisfies z.ZodType<HomeFurnishing>;
