import type { PositionedElement } from "vue-block-editor-headless";

import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import {
  ALT_TEXT_DESCRIPTION,
  ARROWHEAD_DESCRIPTION,
  COLOR_DESCRIPTION,
  CORNER_STYLE_DESCRIPTION,
  DASH_PATTERN_DESCRIPTION,
  FILL_DESCRIPTION,
  FREEHAND_STROKE_WIDTH_DESCRIPTION,
  HORIZONTAL_ALIGNMENT_DESCRIPTION,
  IS_WRAPPED_DESCRIPTION,
  SKETCH_LEVEL_DESCRIPTION,
  STROKE_WIDTH_DESCRIPTION,
  TEXT_SIZE_DESCRIPTION,
  VERTICAL_ALIGNMENT_DESCRIPTION,
} from "#shared/services/resource/whiteboard/constants";
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

// An arrow end's point is the connection point its binding names, so the core derives it and refuses a bound end whose
// Point is off that connection point. The end is strict, as the core's end is, since a spread of its fields does not
// Carry the strict mode, so a stored end carrying a key this schema does not name fails its parse too
const whiteboardArrowEndSchema = z.strictObject({
  ...arrowEndSchema.shape,
  arrowhead: arrowEndSchema.shape.arrowhead.meta({ description: ARROWHEAD_DESCRIPTION }),
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
  textSize: arrowElementSchema.shape.textSize.meta({ description: TEXT_SIZE_DESCRIPTION }),
});

const whiteboardShapeSchema = z.object({
  ...shapeElementSchema.shape,
  color: shapeElementSchema.shape.color.meta({ description: COLOR_DESCRIPTION }),
  cornerStyle: shapeElementSchema.shape.cornerStyle.meta({ description: CORNER_STYLE_DESCRIPTION }),
  dashPattern: shapeElementSchema.shape.dashPattern.meta({ description: DASH_PATTERN_DESCRIPTION }),
  fill: shapeElementSchema.shape.fill.meta({ description: FILL_DESCRIPTION }),
  horizontalAlignment: shapeElementSchema.shape.horizontalAlignment.meta({
    description: HORIZONTAL_ALIGNMENT_DESCRIPTION,
  }),
  sketchLevel: shapeElementSchema.shape.sketchLevel.meta({ description: SKETCH_LEVEL_DESCRIPTION }),
  strokeWidth: shapeElementSchema.shape.strokeWidth.meta({ description: STROKE_WIDTH_DESCRIPTION }),
  text: z.string().max(MAX_RESOURCE_CONTENT_SIZE),
  textSize: shapeElementSchema.shape.textSize.meta({ description: TEXT_SIZE_DESCRIPTION }),
  verticalAlignment: shapeElementSchema.shape.verticalAlignment.meta({ description: VERTICAL_ALIGNMENT_DESCRIPTION }),
});

const whiteboardStickyNoteSchema = z.object({
  ...stickyNoteElementSchema.shape,
  color: stickyNoteElementSchema.shape.color.meta({ description: COLOR_DESCRIPTION }),
  dashPattern: stickyNoteElementSchema.shape.dashPattern.meta({ description: DASH_PATTERN_DESCRIPTION }),
  horizontalAlignment: stickyNoteElementSchema.shape.horizontalAlignment.meta({
    description: HORIZONTAL_ALIGNMENT_DESCRIPTION,
  }),
  sketchLevel: stickyNoteElementSchema.shape.sketchLevel.meta({ description: SKETCH_LEVEL_DESCRIPTION }),
  strokeWidth: stickyNoteElementSchema.shape.strokeWidth.meta({ description: STROKE_WIDTH_DESCRIPTION }),
  text: z.string().max(MAX_RESOURCE_CONTENT_SIZE),
  textSize: stickyNoteElementSchema.shape.textSize.meta({ description: TEXT_SIZE_DESCRIPTION }),
  verticalAlignment: stickyNoteElementSchema.shape.verticalAlignment.meta({
    description: VERTICAL_ALIGNMENT_DESCRIPTION,
  }),
});

const whiteboardImageSchema = z.object({
  ...imageElementSchema.shape,
  altText: imageElementSchema.shape.altText.max(MAX_RESOURCE_CONTENT_SIZE).meta({ description: ALT_TEXT_DESCRIPTION }),
});

const whiteboardStrokeSchema = z.object({
  ...strokeElementSchema.shape,
  color: strokeElementSchema.shape.color.meta({ description: COLOR_DESCRIPTION }),
  points: strokeElementSchema.shape.points.max(MAX_RESOURCE_CONTENT_SIZE),
  strokeWidth: strokeElementSchema.shape.strokeWidth.meta({ description: FREEHAND_STROKE_WIDTH_DESCRIPTION }),
});

const whiteboardTextSchema = z.object({
  ...textElementSchema.shape,
  color: textElementSchema.shape.color.meta({ description: COLOR_DESCRIPTION }),
  horizontalAlignment: textElementSchema.shape.horizontalAlignment.meta({
    description: HORIZONTAL_ALIGNMENT_DESCRIPTION,
  }),
  isWrapped: textElementSchema.shape.isWrapped.meta({ description: IS_WRAPPED_DESCRIPTION }),
  text: z.string().max(MAX_RESOURCE_CONTENT_SIZE),
  textSize: textElementSchema.shape.textSize.meta({ description: TEXT_SIZE_DESCRIPTION }),
});

export const whiteboardElementSchema = z.discriminatedUnion("type", [
  whiteboardArrowSchema,
  whiteboardImageSchema,
  whiteboardShapeSchema,
  whiteboardStickyNoteSchema,
  whiteboardStrokeSchema,
  whiteboardTextSchema,
]) satisfies z.ZodType<PositionedElement>;
