import { computeFencedLines } from "#src/services/skills/extract/computeFencedLines";
import { getHeadingLevel } from "#src/services/skills/extract/getHeadingLevel";

// Each line's heading level, 0 inside a fenced block too, so a `# comment` in a shell example is not read as a heading
// That ends the section holding it
export const computeHeadingLevels = (lines: string[]): number[] => {
  const fencedLines = computeFencedLines(lines);
  return lines.map((line, index) => (fencedLines[index] ? 0 : getHeadingLevel(line)));
};
