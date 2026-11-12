import { SketchLevel } from "#src/models/SketchLevel";

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
// How far a hand-drawn offset may move a point, in either direction, in document units, at the artist level
export const SKETCH_OFFSET_LIMIT = 1.5;
// How far each sketch level's offset reaches, as a multiple of that limit: architect draws no offset, and cartoonist a larger one than artist
export const SKETCH_LEVEL_AMPLITUDES: Record<SketchLevel, number> = {
  [SketchLevel.Architect]: 0,
  [SketchLevel.Artist]: 1,
  [SketchLevel.Cartoonist]: 2,
};
// A round corner curves by this share of the shorter side of its shape, and never by more than the limit, in document units
export const CORNER_RADIUS_SHARE = 0.25;
export const CORNER_RADIUS_LIMIT = 12;
// The modulus that keeps a sketch's hash in range, a Mersenne prime so the hash spreads across the range
export const SKETCH_HASH_MODULUS = 2_147_483_647;
export const TEXT_FONT_FAMILY = "sans-serif";
// The line step of a text is a share of its size, so a larger text's lines keep the spacing a smaller one's do
export const TEXT_LINE_HEIGHT_SHARE = 1.25;
// The advance of a narrow character is a share of its text's size, and a full-width one is this many narrow characters wide
// A text wraps at these estimates, not at the font's own measures, so every machine and the server break it at the same words
export const TEXT_CHARACTER_WIDTH_SHARE = 0.5;
export const TEXT_WIDE_CHARACTER_FACTOR = 2;
// The characters a full-width script sets: the Han ideographs, Hangul, kana, and the fullwidth forms
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const TEXT_WIDE_CHARACTER_REGEX: RegExp =
  /\p{Ideographic}|\p{Script=Hangul}|\p{Script=Hiragana}|\p{Script=Katakana}|[\u{FF01}-\u{FF60}\u{FFE0}-\u{FFE6}]/u;
// The length of an arrowhead along its arrow, and its half-width across it, in document units
export const ARROWHEAD_LENGTH = 12;
export const ARROWHEAD_HALF_WIDTH = 5;
