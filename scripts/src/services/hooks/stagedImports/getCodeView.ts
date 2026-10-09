// The source with its comments removed and every string literal swapped for a numbered placeholder, the literal's
// Text kept in the returned list. A comment's import is not an import, and a string's text is not code, so the
// Specifier pattern only ever matches an import the code makes
export const getCodeView = (source: string): { code: string; strings: string[] } => {
  const strings: string[] = [];
  let code = "";
  let index = 0;
  while (index < source.length) {
    const character = source[index];
    const nextCharacter = source[index + 1];
    if (character === "/" && nextCharacter === "/") {
      const lineEnd = source.indexOf("\n", index);
      index = lineEnd === -1 ? source.length : lineEnd;
    } else if (character === "/" && nextCharacter === "*") {
      const commentEnd = source.indexOf("*/", index + 2);
      index = commentEnd === -1 ? source.length : commentEnd + 2;
      code += " ";
    } else if (character === "'" || character === '"' || character === "`") {
      const stringEnd = getStringEnd(source, index);
      strings.push(source.slice(index + 1, stringEnd));
      code += `${strings.length - 1}`;
      index = stringEnd + 1;
    } else {
      code += character;
      index++;
    }
  }
  return { code, strings };
};

// The index of a string's closing quote, a template's closing backtick being the only quote that may span a line
const getStringEnd = (source: string, start: number): number => {
  const quote = source[start];
  for (let index = start + 1; index < source.length; index++) {
    const character = source[index];
    if (character === "\\") index++;
    else if (character === quote) return index;
    else if (character === "\n" && quote !== "`") return index;
  }
  return source.length;
};
