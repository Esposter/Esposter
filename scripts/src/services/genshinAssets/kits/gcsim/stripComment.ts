const SCALAR_START_REGEX = /(?:^|[:\-[{,])\s*$/u;

// A line with its comment cut off: a `#` that starts the line or follows a space, outside any quoted scalar. A quote
// Opens one only where a scalar starts, so an apostrophe inside plain text opens nothing
export const stripComment = (line: string): string => {
  let quote: string | undefined;
  for (let index = 0; index < line.length; index++) {
    const character = line[index] ?? "";
    if (quote !== undefined) {
      if (character === quote) quote = undefined;
    } else if (['"', "'"].includes(character) && SCALAR_START_REGEX.test(line.slice(0, index))) quote = character;
    else if (character === "#" && (index === 0 || line[index - 1] === " ")) return line.slice(0, index);
  }
  return line;
};
