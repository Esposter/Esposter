// The padding an export draws around its elements, in document units
export const EXPORT_PADDING = 16;
// The fill of an export's canvas, behind every element
export const EXPORT_BACKGROUND_COLOR = "#ffffff";
// The colour of an outline, a line, an arrowhead and a text that has no colour of its own, which the export draws dark
export const EXPORT_LINE_COLOR = "#1e1e1e";
// The dash and the gap of a dashed outline or route, in document units
export const STROKE_DASH_LENGTH = 8;
export const STROKE_GAP_LENGTH = 6;
// A dotted outline or route has no dash, so its round caps draw one dot at the start of each gap
export const DOTTED_STROKE_DASH_LENGTH = 0;
// How far a hand-drawn offset may move a point, in either direction, in document units
export const SKETCH_OFFSET_LIMIT = 1.5;
// The modulus that keeps a sketch's hash in range, a Mersenne prime so the hash spreads across the range
export const SKETCH_HASH_MODULUS = 2_147_483_647;
export const TEXT_FONT_FAMILY = "sans-serif";
// The size and line height of a text, in document units
export const TEXT_FONT_SIZE = 16;
export const TEXT_LINE_HEIGHT = 20;
// The advance of a narrow character, and of a full-width one at double it, in document units
// A text wraps at these estimates, not at the font's own measures, so every machine and the server break it at the same words
export const TEXT_CHARACTER_WIDTH: number = TEXT_FONT_SIZE / 2;
export const TEXT_WIDE_CHARACTER_WIDTH: number = TEXT_CHARACTER_WIDTH * 2;
// The characters a full-width script sets: the Han ideographs, Hangul, kana, and the fullwidth forms
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const TEXT_WIDE_CHARACTER_REGEX: RegExp =
  /\p{Ideographic}|\p{Script=Hangul}|\p{Script=Hiragana}|\p{Script=Katakana}|[\u{FF01}-\u{FF60}\u{FFE0}-\u{FFE6}]/u;
// The length of an arrowhead along its arrow, and its half-width across it, in document units
export const ARROWHEAD_LENGTH = 12;
export const ARROWHEAD_HALF_WIDTH = 5;
