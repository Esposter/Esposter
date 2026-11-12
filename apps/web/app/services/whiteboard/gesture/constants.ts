import { StrokeWidth } from "vue-block-editor-headless";

// The distance in screen pixels within which a pointer hits an element or the resize handle of the selected one
export const HIT_TOLERANCE = 6;
// The smallest size an element takes when resized, in document units
export const MINIMUM_ELEMENT_SIZE = 16;
// The middle button, which pans the canvas whatever the tool
export const MIDDLE_BUTTON = 1;
// The primary button, which starts a select, draw or resize gesture
export const PRIMARY_BUTTON = 0;
// The distance in document units the pointer travels before a stroke takes another point
export const STROKE_SAMPLE_DISTANCE = 1;
// The width of a freehand stroke, which is medium, the width a stroke has always drawn at
export const STROKE_WIDTH = StrokeWidth.Medium;
