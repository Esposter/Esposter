import { getFencedLines } from "#src/services/skills/extract/getFencedLines";
import { getHeadingLevel } from "#src/services/skills/extract/getHeadingLevel";

// Each line's heading level, 0 inside a fenced block too, so a `# comment` in a shell example is not read as a heading
// That ends the section holding it
export const getHeadingLevels = (lines: string[]): number[] => {
  const fencedLines = getFencedLines(lines);
  return lines.map((line, index) => (fencedLines[index] ? 0 : getHeadingLevel(line)));
};
