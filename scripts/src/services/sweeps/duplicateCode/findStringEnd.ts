// The index just past the string literal opening at `open`, or the line's end when it is not closed on the line
export const findStringEnd = (line: string, open: number): number => {
  const quote = line[open];
  for (let index = open + 1; index < line.length; index++)
    if (line[index] === "\\") index++;
    else if (line[index] === quote) return index + 1;
  return line.length;
};
