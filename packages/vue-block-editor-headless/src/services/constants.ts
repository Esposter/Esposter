// The connection points a shape has, numbered from the top point clockwise: top, right, bottom and left
export const CONNECTION_POINT_COUNT = 4;
// The straight run an arrow makes out of a bound end, along the end's direction, before it turns
export const ARROW_STUB_LENGTH = 16;
// The width an arrow's label wraps at, in document units. An arrow has no box of its own to wrap a label at, so the width is a constant
export const ARROW_LABEL_WIDTH = 120;
// The straight pieces a curved arrow is sampled into
export const ARROW_CURVE_SEGMENT_COUNT = 16;
// The sides an ellipse's outline is sampled into
export const ELLIPSE_OUTLINE_SEGMENT_COUNT = 32;
// The slant of an input or output shape's sides, as a share of its width
export const INPUT_OUTPUT_SLANT_RATIO = 0.2;
// A fill colour written as six hex digits
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const HEX_COLOR_REGEX: RegExp = /^#[\dA-Fa-f]{6}$/u;
// The slots of a node that holds no children, typed with a never element so it is assignable to every node type's slots
export const NO_BLOCK_SLOTS: Readonly<Record<string, readonly never[]>> = {};
