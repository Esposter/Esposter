import { getTextWidth } from "#src/services/export/getTextWidth";

// A paragraph's lines at a width: a word joins the line before it while the line still fits, and otherwise starts the next one
// A word wider than the width breaks at the character where the width runs out, and no hyphen is drawn
export const wrapParagraph = (paragraph: string, width: number): string[] => {
  const lines: string[] = [];
  let line = "";
  let lineWidth = 0;
  for (const word of paragraph.split(" ")) {
    const joined = line ? ` ${word}` : word;
    const joinedWidth = getTextWidth(joined);
    if (lineWidth + joinedWidth <= width) {
      line += joined;
      lineWidth += joinedWidth;
      continue;
    }

    if (line) lines.push(line);
    line = "";
    lineWidth = 0;
    for (const character of word) {
      const characterWidth = getTextWidth(character);
      if (line && lineWidth + characterWidth > width) {
        lines.push(line);
        line = "";
        lineWidth = 0;
      }

      line += character;
      lineWidth += characterWidth;
    }
  }
  lines.push(line);
  return lines;
};
