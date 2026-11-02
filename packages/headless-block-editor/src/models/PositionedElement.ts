import type { ArrowElement } from "#src/models/ArrowElement";
import type { ImageElement } from "#src/models/ImageElement";
import type { ShapeElement } from "#src/models/ShapeElement";
import type { StickyNoteElement } from "#src/models/StickyNoteElement";
import type { StrokeElement } from "#src/models/StrokeElement";
import type { TextElement } from "#src/models/TextElement";

import { arrowElementSchema } from "#src/models/ArrowElement";
import { imageElementSchema } from "#src/models/ImageElement";
import { shapeElementSchema } from "#src/models/ShapeElement";
import { stickyNoteElementSchema } from "#src/models/StickyNoteElement";
import { strokeElementSchema } from "#src/models/StrokeElement";
import { textElementSchema } from "#src/models/TextElement";
import { z } from "zod";

export type PositionedElement =
  | ArrowElement
  | ImageElement
  | ShapeElement
  | StickyNoteElement
  | StrokeElement
  | TextElement;

export const positionedElementSchema: z.ZodDiscriminatedUnion<
  [
    typeof arrowElementSchema,
    typeof imageElementSchema,
    typeof shapeElementSchema,
    typeof stickyNoteElementSchema,
    typeof strokeElementSchema,
    typeof textElementSchema,
  ]
> = z.discriminatedUnion("type", [
  arrowElementSchema,
  imageElementSchema,
  shapeElementSchema,
  stickyNoteElementSchema,
  strokeElementSchema,
  textElementSchema,
]) satisfies z.ZodType<PositionedElement>;
