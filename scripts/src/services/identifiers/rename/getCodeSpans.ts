// The spans of TypeScript source that are code, as [start, end) offsets: a string, a comment and a template literal's
// Text are left out, and a template literal's `${…}` expressions are code again at any depth. A rename rewrites only
// Inside these, so a word in a sentence or a string that shares a renamed name's spelling is never touched
export const getCodeSpans = (text: string): [number, number][] => {
  const spans: [number, number][] = [];
  // The brace depth at which each open `${` began, so its closing brace returns to the template's text
  const templateDepths: number[] = [];
  let braceDepth = 0;
  let start = 0;
  let index = 0;
  const closeSpan = (end: number) => {
    if (end > start) spans.push([start, end]);
  };

  while (index < text.length) {
    const character = text[index];
    const next = text[index + 1];
    if (character === "/" && (next === "/" || next === "*")) {
      closeSpan(index);
      const end = next === "/" ? text.indexOf("\n", index) : text.indexOf("*/", index + 2);
      index = end === -1 ? text.length : next === "/" ? end : end + 2;
      start = index;
    } else if (character === "'" || character === '"') {
      closeSpan(index);
      index += 1;
      while (index < text.length && text[index] !== character) index += text[index] === "\\" ? 2 : 1;
      index += 1;
      start = index;
    } else if (character === "`" || (character === "}" && templateDepths.at(-1) === braceDepth)) {
      if (character === "}") templateDepths.pop();
      closeSpan(index);
      index += 1;
      while (index < text.length) {
        const templateCharacter = text[index];
        if (templateCharacter === "\\") index += 2;
        else if (templateCharacter === "`") {
          index += 1;
          break;
        } else if (templateCharacter === "$" && text[index + 1] === "{") {
          templateDepths.push(braceDepth);
          index += 2;
          break;
        } else index += 1;
      }
      start = index;
    } else {
      if (character === "{") braceDepth += 1;
      else if (character === "}") braceDepth -= 1;
      index += 1;
    }
  }

  closeSpan(text.length);
  return spans;
};
