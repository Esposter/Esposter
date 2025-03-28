import type { LayoutItem as BaseLayoutItem } from "grid-layout-plus";

import { z } from "zod";

export type LayoutItem = BaseLayoutItem & { i: string };

export const layoutItemSchema = z.object({
  h: z.number().int().nonnegative(),
  i: z.string().uuid(),
  isDraggable: z.boolean().optional(),
  isResizable: z.boolean().optional(),
  maxH: z.number().int().nonnegative().optional(),
  maxW: z.number().int().nonnegative().optional(),
  minH: z.number().int().nonnegative().optional(),
  minW: z.number().int().nonnegative().optional(),
  moved: z.boolean().optional(),
  static: z.boolean().optional(),
  w: z.number().int().nonnegative(),
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
}) as const satisfies z.ZodType<LayoutItem>;
