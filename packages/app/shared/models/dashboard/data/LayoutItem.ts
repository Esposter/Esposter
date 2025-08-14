import type { LayoutItem as BaseLayoutItem } from "grid-layout-plus";

import { z } from "zod";

export type LayoutItem = BaseLayoutItem & { i: string };

export const layoutItemSchema = z.object({
  h: z.int().nonnegative(),
  i: z.uuid(),
  isDraggable: z.boolean().optional(),
  isResizable: z.boolean().optional(),
  maxH: z.int().nonnegative().optional(),
  maxW: z.int().nonnegative().optional(),
  minH: z.int().nonnegative().optional(),
  minW: z.int().nonnegative().optional(),
  moved: z.boolean().optional(),
  static: z.boolean().optional(),
  w: z.int().nonnegative(),
  x: z.int().nonnegative(),
  y: z.int().nonnegative(),
}) satisfies z.ZodType<LayoutItem>;
