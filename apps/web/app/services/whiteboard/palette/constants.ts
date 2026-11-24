import type { Size } from "vue-block-editor-headless";

import { ArrowheadKind } from "vue-block-editor-headless";

// The size each thing a placing tool places takes, in document units. A shape's text is drawn inside its box
export const WHITEBOARD_SHAPE_SIZE: Size = { height: 80, width: 120 };
export const WHITEBOARD_STICKY_NOTE_SIZE: Size = { height: 120, width: 160 };
// A text box stores no height, since its text sets it, so this height is only the room it is centred in when placed
export const WHITEBOARD_TEXT_BOX_SIZE: Size = { height: 40, width: 160 };
export const WHITEBOARD_IMAGE_SIZE: Size = { height: 240, width: 240 };
// How far each image of a multi-file insert sits from the one picked before it, in document units.
// Half its width, so every image shows past the one over it.
export const WHITEBOARD_IMAGE_INSERT_OFFSET = WHITEBOARD_IMAGE_SIZE.width / 2;
// The fill a placed shape starts with is none, so a shape on a dark page does not hide its own text behind a white box.
// The properties panel changes it, and clears it back to none.
export const WHITEBOARD_SHAPE_FILL = "";
// The fill a placed sticky note starts with, which the properties panel changes
export const WHITEBOARD_STICKY_NOTE_FILL = "#fde68a";
// The arrowhead an arrow's end takes when drawn: a triangle, the head every arrow had before one could be chosen.
export const WHITEBOARD_DEFAULT_ARROWHEAD = ArrowheadKind.Triangle;
// The colour an element with none chosen draws its outline and text in: the page's text colour.
// The browser takes that colour from the theme.
export const WHITEBOARD_TEXT_COLOR = "currentColor";
// The text a placed text box starts with, so it draws and can be double clicked to edit
export const WHITEBOARD_TEXT_BOX_TEXT = "Text";
