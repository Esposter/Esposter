import { stripToFixedPoint } from "#src/services/shared/stripToFixedPoint";

// A text map string as the game shows it on a PC: the leading `#` that marks a string with placeholders dropped,
// Its escaped line breaks and non-breaking spaces real, its rich-text tags and furigana gone, and of its
// Per-platform variants the PC's kept. What the game fills per player — the nickname, a word per gender — is left
// For the reader to fill
const PLACEHOLDER_MARKER = "#";
const NON_BREAKING_SPACE_PLACEHOLDER = "{NON_BREAK_SPACE}";
const ESCAPED_LINE_BREAK = String.raw`\n`;
const RICH_TEXT_TAG_REGEX = /<\/?[a-z]+(?:=[^>]*)?>/giu;
const PC_LAYOUT_REGEX = /\{LAYOUT_PC#(?<text>[^}]*)\}/gu;
const OTHER_LAYOUT_OR_RUBY_REGEX = /\{(?:LAYOUT_[A-Z]+|RUBY)#[^}]*\}/gu;

export const getPlainGameText = (text: string): string =>
  stripToFixedPoint(
    (text.startsWith(PLACEHOLDER_MARKER) ? text.slice(PLACEHOLDER_MARKER.length) : text)
      .replaceAll(ESCAPED_LINE_BREAK, "\n")
      .replaceAll(NON_BREAKING_SPACE_PLACEHOLDER, " "),
    RICH_TEXT_TAG_REGEX,
  )
    .replaceAll(PC_LAYOUT_REGEX, "$<text>")
    .replaceAll(OTHER_LAYOUT_OR_RUBY_REGEX, "");
