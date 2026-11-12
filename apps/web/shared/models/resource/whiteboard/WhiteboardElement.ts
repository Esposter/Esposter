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

// The descriptions of the style fields, shared by every element that holds one, so an agent reads the same words for the same field
const COLOR_DESCRIPTION =
  "The colour the element's outline and text draw in, as six hex digits. Empty draws in the page's text colour, which follows the theme";
const DASH_PATTERN_DESCRIPTION =
  "The line the outline or the route draws in: solid, dashed or dotted. Solid when left out";
const FILL_DESCRIPTION =
  "The fill of the shape, as six hex digits. Empty is no fill, so the shape's outline stands on the page alone";
const STROKE_WIDTH_DESCRIPTION =
  "The width of the outline, the route or the stroke in document units: 1 for thin, 2 for medium or 4 for bold. Medium when left out";
const SKETCH_LEVEL_DESCRIPTION =
  "How hand-drawn the outline or the route is: architect draws it straight, artist with the usual sketch, or cartoonist with a larger one. Artist when left out";
const CORNER_STYLE_DESCRIPTION =
  "The shape's corners: sharp, or round with a radius that grows with the shape up to a limit. Sharp when left out. An ellipse has no corners to round";

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
  color: arrowElementSchema.shape.color.meta({ description: COLOR_DESCRIPTION }),
  dashPattern: arrowElementSchema.shape.dashPattern.meta({ description: DASH_PATTERN_DESCRIPTION }),
  end: whiteboardArrowEndSchema,
  label: z.string().max(MAX_RESOURCE_CONTENT_SIZE),
  sketchLevel: arrowElementSchema.shape.sketchLevel.meta({ description: SKETCH_LEVEL_DESCRIPTION }),
  start: whiteboardArrowEndSchema,
  strokeWidth: arrowElementSchema.shape.strokeWidth.meta({ description: STROKE_WIDTH_DESCRIPTION }),
});

const whiteboardShapeSchema = z.object({
  ...shapeElementSchema.shape,
  color: shapeElementSchema.shape.color.meta({ description: COLOR_DESCRIPTION }),
  cornerStyle: shapeElementSchema.shape.cornerStyle.meta({ description: CORNER_STYLE_DESCRIPTION }),
  dashPattern: shapeElementSchema.shape.dashPattern.meta({ description: DASH_PATTERN_DESCRIPTION }),
  fill: shapeElementSchema.shape.fill.meta({ description: FILL_DESCRIPTION }),
  sketchLevel: shapeElementSchema.shape.sketchLevel.meta({ description: SKETCH_LEVEL_DESCRIPTION }),
  strokeWidth: shapeElementSchema.shape.strokeWidth.meta({ description: STROKE_WIDTH_DESCRIPTION }),
  text: z.string().max(MAX_RESOURCE_CONTENT_SIZE),
});

const whiteboardStickyNoteSchema = z.object({
  ...stickyNoteElementSchema.shape,
  color: stickyNoteElementSchema.shape.color.meta({ description: COLOR_DESCRIPTION }),
  dashPattern: stickyNoteElementSchema.shape.dashPattern.meta({ description: DASH_PATTERN_DESCRIPTION }),
  sketchLevel: stickyNoteElementSchema.shape.sketchLevel.meta({ description: SKETCH_LEVEL_DESCRIPTION }),
  strokeWidth: stickyNoteElementSchema.shape.strokeWidth.meta({ description: STROKE_WIDTH_DESCRIPTION }),
  text: z.string().max(MAX_RESOURCE_CONTENT_SIZE),
});

const whiteboardStrokeSchema = z.object({
  ...strokeElementSchema.shape,
  color: strokeElementSchema.shape.color.meta({ description: COLOR_DESCRIPTION }),
  points: strokeElementSchema.shape.points.max(MAX_RESOURCE_CONTENT_SIZE),
  strokeWidth: strokeElementSchema.shape.strokeWidth.meta({ description: STROKE_WIDTH_DESCRIPTION }),
});

const whiteboardTextSchema = z.object({
  ...textElementSchema.shape,
  color: textElementSchema.shape.color.meta({ description: COLOR_DESCRIPTION }),
  text: z.string().max(MAX_RESOURCE_CONTENT_SIZE),
});

export const whiteboardElementSchema = z.discriminatedUnion("type", [
  whiteboardArrowSchema,
  imageElementSchema,
  whiteboardShapeSchema,
  whiteboardStickyNoteSchema,
  whiteboardStrokeSchema,
  whiteboardTextSchema,
]) satisfies z.ZodType<WhiteboardElement>;
