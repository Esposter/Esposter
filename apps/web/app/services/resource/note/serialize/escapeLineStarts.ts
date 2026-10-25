import { LINE_START_MARKER_REGEX, LINE_START_WHITESPACE_REGEX } from "@/services/resource/note/serialize/constants";

// Four columns of leading whitespace read back as a code block, so it is written as references first.
// A paragraph line that begins with a block marker reads back as that block, so the marker is escaped
const escapeLeadingWhitespace = (whitespace: string) => whitespace.replaceAll(" ", "&#32;").replaceAll("\t", "&#9;");

export const escapeLineStarts = (text: string) =>
  text
    .replaceAll(LINE_START_WHITESPACE_REGEX, escapeLeadingWhitespace)
    .replaceAll(LINE_START_MARKER_REGEX, String.raw`$<indent>\$<marker>`);
