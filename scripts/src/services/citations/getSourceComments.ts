import type { SourceComments } from "#src/models/citations/SourceComments";

import { parseSync } from "oxc-parser";

const SPACE_BYTE = 0x20;
const SCRIPT_EXTENSION_REGEX = /\.[cm]?[jt]sx?$/u;
const VUE_EXTENSION_REGEX = /\.vue$/u;
const HASH_EXTENSION_REGEX = /\.(?:ya?ml|toml|sh|ps1)$/u;
const MARKUP_EXTENSION_REGEX = /\.html$/u;
const STYLE_EXTENSION_REGEX = /\.css$/u;
const SCRIPT_BLOCK_REGEX = /(?<open><script\b[^>]*>)(?<content>[\s\S]*?)(?<close><\/script>)/gu;
const HTML_COMMENT_REGEX = /<!--(?<body>[\s\S]*?)-->/gu;
const CSS_COMMENT_REGEX = /\/\*(?<body>[\s\S]*?)\*\//gu;
// A hash opens a comment only at the start of a line or after a space, so the `#` of `C#` or of a URL's fragment is
// Not one
const HASH_COMMENT_REGEX = /(?<=^|\s)#(?<body>[^\n]*)/gmu;

// Every match of `text` blanked to spaces, with the body of each one. A match is blanked whole, so the words either
// Side of it cannot run together into one
const blankMatches = (text: string, regex: RegExp): SourceComments => ({
  code: text.replaceAll(regex, (match) => " ".repeat(match.length)),
  comments: Array.from(text.matchAll(regex), ({ groups }) => groups?.body ?? ""),
});

// Every match of `text` rewritten by `replace`, the text between matches kept as it was
const replaceMatches = (text: string, regex: RegExp, replace: (match: RegExpExecArray) => string): string => {
  let code = "";
  let cursor = 0;
  for (const match of text.matchAll(regex)) {
    code += text.slice(cursor, match.index) + replace(match);
    cursor = match.index + match[0].length;
  }
  return code + text.slice(cursor);
};

// A parser's spans are UTF-8 byte offsets rather than character offsets, so the comments are blanked in the source's
// Bytes, where the span of a comment is the span it occupies
const blankScript = (path: string, text: string): SourceComments => {
  const bytes = Buffer.from(text);
  const comments = parseSync(path, text).comments.map(({ end, start, value }) => {
    bytes.fill(SPACE_BYTE, start, end);
    return value;
  });
  return { code: bytes.toString(), comments };
};

// A component's comments are its script's, read by the parser, and the HTML comments of its template and the CSS
// Comments of its styles, which are read as the markup and the stylesheet they are
const blankVue = (text: string): SourceComments => {
  const scripts: string[] = [];
  const withoutScripts = replaceMatches(text, SCRIPT_BLOCK_REGEX, ({ groups }) => {
    const script = blankScript("script.ts", groups?.content ?? "");
    scripts.push(...script.comments);
    return (groups?.open ?? "") + script.code + (groups?.close ?? "");
  });
  const markup = blankMatches(withoutScripts, HTML_COMMENT_REGEX);
  const style = blankMatches(markup.code, CSS_COMMENT_REGEX);
  return { code: style.code, comments: [...scripts, ...markup.comments, ...style.comments] };
};

// The code of a source file with its comments blanked, and the body of each comment it holds. A file whose syntax has
// No comment syntax read here is all code
export const getSourceComments = (path: string, text: string): SourceComments => {
  if (SCRIPT_EXTENSION_REGEX.test(path)) return blankScript(path, text);
  if (VUE_EXTENSION_REGEX.test(path)) return blankVue(text);
  if (HASH_EXTENSION_REGEX.test(path)) return blankMatches(text, HASH_COMMENT_REGEX);
  if (MARKUP_EXTENSION_REGEX.test(path)) return blankMatches(text, HTML_COMMENT_REGEX);
  if (STYLE_EXTENSION_REGEX.test(path)) return blankMatches(text, CSS_COMMENT_REGEX);
  return { code: text, comments: [] };
};
