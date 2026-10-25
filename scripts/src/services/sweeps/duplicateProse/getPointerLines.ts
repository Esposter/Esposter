import { POINTER_HEADINGS } from "#src/services/sweeps/duplicateProse/constants";

// The lines under the two pointer headings, the ones a convention already decides the shape of
export const getPointerLines = (text: string): string[] => {
  const lines: string[] = [];
  let isUnderPointerHeading = false;
  for (const line of text.split("\n"))
    if (line.startsWith("## ")) isUnderPointerHeading = POINTER_HEADINGS.has(line);
    else if (isUnderPointerHeading && (line.startsWith("- ") || line.startsWith("| "))) lines.push(line);
  return lines;
};
