import { getFencedLines } from "#src/services/skills/extract/getFencedLines";

// A rejection a reader would propose is found only where they look first, so the list is its skill's first
// Section under the one heading. A reworded heading or a list on a reference page reads the same to a person and
// Escapes the order check, which is how rejections drift to the foot of a page nobody opens before proposing. A
// Heading inside a fenced example is not one
export const getHeadings = (text: string): string[] => {
  const lines = text.split("\n");
  const fencedLines = getFencedLines(lines);
  return lines.filter((line, index) => !fencedLines[index] && line.startsWith("## "));
};
