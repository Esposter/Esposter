// The descriptions of the style fields, shared by every element that holds one, so an agent reads the same words for
// The same field
export const COLOR_DESCRIPTION =
  "The colour the element's outline and text draw in, as six hex digits. Empty draws in the page's text colour, which follows the theme";
export const DASH_PATTERN_DESCRIPTION =
  "The line the outline or the route draws in: solid, dashed or dotted. Solid when left out";
export const FILL_DESCRIPTION =
  "The fill of the shape, as six hex digits. Empty is no fill, so the shape's outline stands on the page alone";
export const STROKE_WIDTH_DESCRIPTION =
  "The width of the outline or the route in document units: 1 for thin, 2 for medium or 4 for bold. Medium when left out";
// A freehand stroke has no default width, so it is always written with one
export const FREEHAND_STROKE_WIDTH_DESCRIPTION =
  "The width of the stroke in document units: 1 for thin, 2 for medium or 4 for bold. Always given";
export const SKETCH_LEVEL_DESCRIPTION =
  "How hand-drawn the outline or the route is: architect draws it straight, artist with the usual sketch, or cartoonist with a larger one. Artist when left out";
export const CORNER_STYLE_DESCRIPTION =
  "The shape's corners: sharp, or round with a radius that grows with the shape up to a limit. Sharp when left out. An ellipse has no corners to round";
export const TEXT_SIZE_DESCRIPTION =
  "The size of the text in document units: 16 for small, 20 for medium, 28 for large or 36 for extra large. Small when left out";
export const HORIZONTAL_ALIGNMENT_DESCRIPTION =
  "Where the text sits across its element: left, centre or right. A shape and a sticky note centre their text, and a text box starts it at its left edge, when left out";
export const VERTICAL_ALIGNMENT_DESCRIPTION =
  "Where the text sits down a shape or a sticky note: top, middle or bottom. Middle when left out";
// An end with no arrowhead leaves the field out, since an enum takes no value for none
export const ARROWHEAD_DESCRIPTION =
  "The arrowhead drawn at this end of the arrow: triangle, diamond, circle or bar. Left out, the end draws no arrowhead";
export const IS_WRAPPED_DESCRIPTION =
  "Whether a text box wraps its text at its width. False is auto width: the text is not wrapped and the box is as wide as its widest line. Wrapped when left out";
export const ALT_TEXT_DESCRIPTION =
  "The alt text that names the image to assistive technology, drawn on no picture. Empty when none is set, which is what a new image holds";
