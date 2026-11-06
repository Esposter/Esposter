import type { PositionedElement } from "vue-block-editor-headless";

import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import {
  arrowElementSchema,
  arrowEndSchema,
  imageElementSchema,
  pointSchema,
  shapeElementSchema,
  stickyNoteElementSchema,
  strokeElementSchema,
  textElementSchema,
} from "vue-block-editor-headless";
import { z } from "zod";

export type WhiteboardElement = PositionedElement;

// An arrow end's point is the connection point its binding names, so the core derives it and an agent is refused a write to it by path
const whiteboardArrowEndSchema = z.object({
  ...arrowEndSchema.shape,
  binding: arrowEndSchema.shape.binding.meta({
    description:
      "The shape this end is bound to, by its id and the index of one of its four connection points, numbered from the top clockwise. An annotation takes no binding",
  }),
  point: pointSchema.meta({
    description:
      "The point the end sits at. Read-only: a bound end's point is its shape's connection point, rerouted by a move",
    readOnly: true,
  }),
});

const whiteboardArrowSchema = z.object({
  ...arrowElementSchema.shape,
  end: whiteboardArrowEndSchema,
  label: z.string().max(MAX_RESOURCE_CONTENT_SIZE),
  start: whiteboardArrowEndSchema,
});

const whiteboardShapeSchema = z.object({
  ...shapeElementSchema.shape,
  text: z.string().max(MAX_RESOURCE_CONTENT_SIZE),
});

const whiteboardStickyNoteSchema = z.object({
  ...stickyNoteElementSchema.shape,
  text: z.string().max(MAX_RESOURCE_CONTENT_SIZE),
});

const whiteboardStrokeSchema = z.object({
  ...strokeElementSchema.shape,
  points: strokeElementSchema.shape.points.max(MAX_RESOURCE_CONTENT_SIZE),
});

const whiteboardTextSchema = z.object({ ...textElementSchema.shape, text: z.string().max(MAX_RESOURCE_CONTENT_SIZE) });

export const whiteboardElementSchema = z.discriminatedUnion("type", [
  whiteboardArrowSchema,
  imageElementSchema,
  whiteboardShapeSchema,
  whiteboardStickyNoteSchema,
  whiteboardStrokeSchema,
  whiteboardTextSchema,
]) satisfies z.ZodType<WhiteboardElement>;
