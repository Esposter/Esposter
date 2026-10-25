import type { TableCharacter } from "#src/models/genshinAssets/kits/gcsim/TableCharacter";

// The characters of a table's literal between its outer braces, each with its line, or undefined where no such table
// Is declared
export const readTableBody = (lines: readonly string[], name: string): TableCharacter[] | undefined => {
  const start = lines.findIndex((line) =>
    new RegExp(`^\\s*(?:var |const )?${name}\\s*(?:=|:=)\\s*\\[\\]`, "u").test(line),
  );
  if (start === -1) return undefined;
  const declaration = lines[start] ?? "";
  if (!declaration.includes("{")) return undefined;
  const body: TableCharacter[] = [];
  let depth = 0;
  for (let lineIndex = start; lineIndex < lines.length; lineIndex++) {
    const text = lines[lineIndex] ?? "";
    for (let character = lineIndex === start ? declaration.indexOf("{") : 0; character < text.length; character++) {
      const char = text.charAt(character);
      if (char === "{") {
        depth++;
        if (depth === 1) continue;
      }
      if (char === "}") {
        depth--;
        if (depth === 0) return body;
      }
      body.push({ char, line: lineIndex + 1 });
    }
    body.push({ char: "\n", line: lineIndex + 1 });
  }
  return undefined;
};
