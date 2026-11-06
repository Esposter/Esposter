import type { BoxElement } from "#src/models/BoxElement";
import type { ShapeKind } from "#src/models/ShapeKind";
import type { ItemEntityType } from "@esposter/shared";

import { boxElementSchema } from "#src/models/BoxElement";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { shapeKindSchema } from "#src/models/ShapeKind";
import { HEX_COLOR_REGEX } from "#src/services/constants";
import { z } from "zod";

// A shape: an outline of one kind, placed by its box, with a fill and text its box holds
export interface ShapeElement extends BoxElement, ItemEntityType<PositionedElementType.Shape> {
  fill: string;
  kind: ShapeKind;
  text: string;
}

export const shapeElementSchema: z.ZodObject<
  typeof boxElementSchema.shape & {
    fill: z.ZodString;
    kind: typeof shapeKindSchema;
    text: z.ZodString;
    type: z.ZodLiteral<PositionedElementType.Shape>;
  }
> = z.object({
  ...boxElementSchema.shape,
  fill: z.string().regex(HEX_COLOR_REGEX),
  kind: shapeKindSchema,
  text: z.string(),
  type: z.literal(PositionedElementType.Shape),
}) satisfies z.ZodType<ShapeElement>;
