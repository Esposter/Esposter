import { z } from "zod";

export interface LayoutItem {
  h: number;
  w: number;
  x: number;
  y: number;
}

export const layoutItemSchema = z.object({
  h: z.int().nonnegative(),
  w: z.int().nonnegative(),
  x: z.int().nonnegative(),
  y: z.int().nonnegative(),
}) satisfies z.ZodType<LayoutItem>;
