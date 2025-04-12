import type { Type } from "arktype";
import type { LayoutItem as BaseLayoutItem } from "grid-layout-plus";

import { type } from "arktype";

export type LayoutItem = BaseLayoutItem & { i: string };

export const layoutItemSchema = type({
  h: "number >= 0",
  i: "string.uuid",
  isDraggable: "boolean?",
  isResizable: "boolean?",
  maxH: "number >= 0?",
  maxW: "number >= 0?",
  minH: "number >= 0?",
  minW: "number >= 0?",
  moved: "boolean?",
  static: "boolean?",
  w: "number >= 0",
  x: "number >= 0",
  y: "number >= 0",
}) satisfies Type<LayoutItem>;
