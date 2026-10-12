// The last top-level JSON object in a text, found by its braces with strings skipped inside it. A session may print prose
// Before its answer, and the answer is the object it was asked to end on. Quotes outside an object are prose, so they
// Are not read.
export const getLastJsonObject = (text: string): string | undefined => {
  let depth = 0;
  let start = 0;
  let isInString = false;
  let isEscaped = false;
  let lastObject: string | undefined;
  for (let index = 0; index < text.length; index += 1) {
    const character = text.charAt(index);
    if (isInString) {
      if (isEscaped) isEscaped = false;
      else if (character === "\\") isEscaped = true;
      else if (character === '"') isInString = false;
    } else if (character === '"' && depth > 0) isInString = true;
    else if (character === "{") {
      if (depth === 0) start = index;
      depth += 1;
    } else if (character === "}" && depth > 0) {
      depth -= 1;
      if (depth === 0) lastObject = text.slice(start, index + 1);
    }
  }
  return lastObject;
};
