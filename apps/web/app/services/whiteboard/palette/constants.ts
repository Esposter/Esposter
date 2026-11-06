import type { Size } from "headless-block-editor";

// The size each thing a placing tool places takes, in document units. A shape's text is drawn inside its box
export const WHITEBOARD_SHAPE_SIZE: Size = { height: 80, width: 120 };
export const WHITEBOARD_STICKY_NOTE_SIZE: Size = { height: 120, width: 160 };
// A text box stores no height, since its text sets it, so this height is only the room it is centred in when placed
export const WHITEBOARD_TEXT_BOX_SIZE: Size = { height: 40, width: 160 };
export const WHITEBOARD_IMAGE_SIZE: Size = { height: 240, width: 240 };
// How far each image of a multi-file insert sits from the one picked before it, in document units: half its width, so every image
// shows past the one over it
export const WHITEBOARD_IMAGE_INSERT_OFFSET = WHITEBOARD_IMAGE_SIZE.width / 2;
// The fill a placed shape and sticky note start with, which the properties panel changes
export const WHITEBOARD_SHAPE_FILL = "#ffffff";
export const WHITEBOARD_STICKY_NOTE_FILL = "#fde68a";
// The text a placed text box starts with, so it draws and can be double clicked to edit
export const WHITEBOARD_TEXT_BOX_TEXT = "Text";
