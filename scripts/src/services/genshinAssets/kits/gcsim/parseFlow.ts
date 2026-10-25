import { parseGcsimYaml } from "#src/services/genshinAssets/kits/gcsim/parseGcsimYaml";
import { parseScalar } from "#src/services/genshinAssets/kits/gcsim/parseScalar";
import { InvalidOperationError, Operation } from "@esposter/shared";

const FLOW_DELIMITER_REGEX = /[,:[\]{}]/u;
const FLOW_SPACE_REGEX = /\s/u;

// A flow collection, `[0, 1]` or `{time: 0.03, scale: 0.01}`, read from its first character to its last, each of its
// Values a scalar or a flow collection of its own
export const parseFlow = (text: string): unknown => {
  let position = 0;
  // A blank line folded into a flow collection is a newline, which the collection reads as the space it is
  const skipSpaces = () => {
    while (FLOW_SPACE_REGEX.test(text[position] ?? "")) position++;
  };
  const readValue = (): unknown => {
    skipSpaces();
    if (text[position] === "[") {
      position++;
      const items: unknown[] = [];
      skipSpaces();
      while (text[position] !== "]") {
        items.push(readValue());
        skipSpaces();
        if (text[position] === ",") position++;
        skipSpaces();
      }
      position++;
      return items;
    } else if (text[position] === "{") {
      position++;
      const entries: [string, unknown][] = [];
      skipSpaces();
      while (text[position] !== "}") {
        const key = String(readValue());
        skipSpaces();
        position++;
        entries.push([key, readValue()]);
        skipSpaces();
        if (text[position] === ",") position++;
        skipSpaces();
      }
      position++;
      return Object.fromEntries(entries);
    }
    const start = position;
    while (position < text.length && !FLOW_DELIMITER_REGEX.test(text[position] ?? "")) position++;
    // A value with no characters, at a delimiter or the end of the text, would leave every loop above where it found it
    if (position === start)
      throw new InvalidOperationError(Operation.Read, parseGcsimYaml.name, `unreadable flow collection "${text}"`);
    return parseScalar(text.slice(start, position).trim());
  };
  return readValue();
};
