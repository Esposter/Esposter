import { HighlightStyleMap, POSTGRES_KEYWORDS } from "#server/services/db/constants";
import { styleText } from "node:util";

type HighlightKind = keyof typeof HighlightStyleMap;

const HIGHLIGHT_KINDS = Object.keys(HighlightStyleMap) as HighlightKind[];
// Longest first, so ORDER is never taken for a prefix of a longer keyword the alternation has yet to try
const KEYWORD_PATTERN = POSTGRES_KEYWORDS.toSorted(
  (firstKeyword, secondKeyword) => secondKeyword.length - firstKeyword.length,
).join("|");
// One alternation read left to right. A word is consumed whole by the last alternative, so a keyword is only ever
// Matched at the start of a word, and no lookbehind is needed. Doubled quotes are the only escape inside a string or
// An identifier, as Postgres reads them, so a backslash is an ordinary character there. An E'...' string is the one
// Exception: its backslash escapes the next character
const TOKEN_REGEX = new RegExp(
  [
    String.raw`(?<comment>--[^\r\n]*|/\*[\s\S]*?\*/)`,
    String.raw`(?<string>(?:[eE]'(?:[^'\\]|\\[\s\S]|'')*'|'(?:[^']|'')*'))`,
    String.raw`(?<identifier>"(?:[^"]|"")*")`,
    String.raw`(?<parameter>\$\d+)`,
    String.raw`(?<keyword>(?:${KEYWORD_PATTERN})\b)`,
    String.raw`(?<function>[a-z_]\w*(?=\s*\())`,
    String.raw`(?<number>(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)`,
    String.raw`[a-z_]\w*`,
  ].join("|"),
  "giu",
);

// Text that is not a token, and a word that is none of them, is kept as typed: the output with its colour stripped
// Is always the input
export const highlightSql = (sql: string) => {
  let highlighted = "";
  let lastIndex = 0;

  for (const match of sql.matchAll(TOKEN_REGEX)) {
    const { index } = match;
    const [token] = match;
    const kind = HIGHLIGHT_KINDS.find((highlightKind) => match.groups?.[highlightKind] !== undefined);

    highlighted += sql.slice(lastIndex, index);
    highlighted += kind ? styleText(HighlightStyleMap[kind], token) : token;
    lastIndex = index + token.length;
  }

  return highlighted + sql.slice(lastIndex);
};
