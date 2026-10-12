import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";

const TOKEN_REGEX =
  /(?<comment>\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(?<newline>\n)|(?<space>[ \t\r]+)|(?<string>"(?:\\.|[^"\\])*"|`[^`]*`|'(?:\\.|[^'\\])*')|(?<number>0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)|(?<identifier>[A-Za-z_]\w*)|(?<punctuation>:=|==|!=|<=|>=|&&|\|\||\+\+|--|[-+*/%=<>!&|^()[\]{},.:;])/gu;

// A Go source file's tokens, comments and spaces left out and each line end kept, since a line end ends a statement
export const tokenizeGo = (source: string): GoToken[] => {
  const tokens: GoToken[] = [];
  let line = 1;
  for (const { groups = {} } of source.matchAll(TOKEN_REGEX)) {
    const { comment, identifier, newline, number, punctuation, string } = groups;
    if (newline !== undefined) {
      tokens.push({ kind: GoTokenKind.Newline, line, text: newline });
      line++;
    } else if (comment !== undefined) line += comment.split("\n").length - 1;
    else if (string !== undefined) {
      tokens.push({ kind: GoTokenKind.String, line, text: string });
      line += string.split("\n").length - 1;
    } else if (number !== undefined) tokens.push({ kind: GoTokenKind.Number, line, text: number });
    else if (identifier !== undefined) tokens.push({ kind: GoTokenKind.Identifier, line, text: identifier });
    else if (punctuation !== undefined) tokens.push({ kind: GoTokenKind.Punctuation, line, text: punctuation });
  }
  return tokens;
};
