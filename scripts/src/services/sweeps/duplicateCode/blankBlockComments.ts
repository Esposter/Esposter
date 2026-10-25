import { findStringEnd } from "#src/services/sweeps/duplicateCode/findStringEnd";

// The line with its block comments blanked to spaces, and whether a block comment is still open at its end.
export const blankBlockComments = (
  line: string,
  isInBlockComment: boolean,
): { code: string; isInBlockComment: boolean } => {
  let code = "";
  let rest = line;
  let isInComment = isInBlockComment;
  while (rest)
    if (isInComment) {
      const end = rest.indexOf("*/");
      if (end === -1) return { code: code + " ".repeat(rest.length), isInBlockComment: true };
      code += " ".repeat(end + 2);
      rest = rest.slice(end + 2);
      isInComment = false;
    } else {
      const token = /\/\*|\/\/|["'`]/u.exec(rest);
      if (!token || token[0] === "//") return { code: code + rest, isInBlockComment: false };
      if (token[0] !== "/*") {
        const end = findStringEnd(rest, token.index);
        code += rest.slice(0, end);
        rest = rest.slice(end);
        continue;
      }
      code += `${rest.slice(0, token.index)}  `;
      rest = rest.slice(token.index + 2);
      isInComment = true;
    }

  return { code, isInBlockComment: isInComment };
};
