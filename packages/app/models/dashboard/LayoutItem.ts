import type { LayoutItem } from "grid-layout-plus";
import { z } from "zod";

export const layoutItemSchema = z.object({
  w: z.number().int().nonnegative(),
  h: z.number().int().nonnegative(),
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
  i: z.string().uuid(),
  minW: z.number().int().nonnegative().optional(),
  minH: z.number().int().nonnegative().optional(),
  maxW: z.number().int().nonnegative().optional(),
  maxH: z.number().int().nonnegative().optional(),
  moved: z.boolean().optional(),
  static: z.boolean().optional(),
  isDraggable: z.boolean().optional(),
  isResizable: z.boolean().optional(),
}) satisfies z.ZodType<LayoutItem>;
