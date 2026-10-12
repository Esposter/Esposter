import type { GcsimYamlLine } from "#src/models/genshinAssets/kits/gcsim/GcsimYamlLine";

import { InvalidOperationError, Operation } from "@esposter/shared";

const FLOW_DELIMITER_REGEX = /[,:[\]{}]/u;
const FLOW_START_REGEX = /^[[{]/u;
const NUMBER_REGEX = /^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/iu;
const KEY_REGEX = /^(?<key>[^\s"#'[{-][^:]*?):(?:\s+(?<value>.*))?$/u;
const SEQUENCE_ITEM_REGEX = /^-(?:\s+(?<item>.*))?$/u;
const SCALAR_START_REGEX = /(?:^|[:\-[{,])\s*$/u;

// A line with its comment cut off: a `#` that starts the line or follows a space, outside any quoted scalar. A quote
// Opens one only where a scalar starts, so an apostrophe inside plain text opens nothing
const stripComment = (line: string): string => {
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

const parseScalar = (text: string): unknown => {
  if (text.startsWith("'") && text.endsWith("'")) return text.slice(1, -1).replaceAll("''", "'");
  else if (text.startsWith('"') && text.endsWith('"')) return text.slice(1, -1);
  else if (NUMBER_REGEX.test(text)) return Number(text);
  else if (["false", "true"].includes(text)) return text === "true";
  else return text;
};

// A flow collection, `[0, 1]` or `{time: 0.03, scale: 0.01}`, read from its first character to its last, each of its
// Values a scalar or a flow collection of its own
const parseFlow = (text: string): unknown => {
  let position = 0;
  const skipSpaces = () => {
    while (text[position] === " ") position++;
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

const parseValue = (text: string): unknown => (FLOW_START_REGEX.test(text) ? parseFlow(text) : parseScalar(text));

// The subset of YAML gcsim's character configs are written in: block mappings and sequences by indentation, a sequence
// Item opening a mapping or a sequence on its own line, flow collections, on a key's line or below it, plain and quoted
// Scalars, and comments.
// Anything past that, an anchor, a tag or a block scalar, is refused rather than read wrong
export const parseGcsimYaml = (yaml: string): unknown => {
  const lines: GcsimYamlLine[] = yaml.split("\n").flatMap((rawLine) => {
    const text = stripComment(rawLine).trimEnd();
    const trimmedText = text.trimStart();
    return trimmedText === "" ? [] : [{ indent: text.length - trimmedText.length, text: trimmedText }];
  });
  let index = 0;
  const parseBlock = (indent: number): unknown => {
    const firstLine = lines[index];
    if (firstLine === undefined) return undefined;
    // A flow collection on a line of its own below its key
    else if (FLOW_START_REGEX.test(firstLine.text)) {
      index++;
      return parseValue(firstLine.text);
    } else if (SEQUENCE_ITEM_REGEX.test(firstLine.text)) {
      const items: unknown[] = [];
      for (
        let line = lines[index];
        line?.indent === indent && SEQUENCE_ITEM_REGEX.test(line.text);
        line = lines[index]
      ) {
        const item = SEQUENCE_ITEM_REGEX.exec(line.text)?.groups?.item;
        if (item === undefined) {
          index++;
          items.push(parseBlock(lines[index]?.indent ?? indent));
        } else if (SEQUENCE_ITEM_REGEX.test(item) || KEY_REGEX.test(item)) {
          // The item opens a nested block on the dash's own line, read as though it started on a line of its own at
          // The column it starts at
          lines[index] = { indent: indent + line.text.length - item.length, text: item };
          items.push(parseBlock(indent + line.text.length - item.length));
        } else {
          index++;
          items.push(parseValue(item));
        }
      }
      return items;
    }
    const entries: [string, unknown][] = [];
    for (
      let line = lines[index];
      line?.indent === indent && !SEQUENCE_ITEM_REGEX.test(line.text);
      line = lines[index]
    ) {
      const groups = KEY_REGEX.exec(line.text)?.groups;
      if (groups?.key === undefined)
        throw new InvalidOperationError(Operation.Read, parseGcsimYaml.name, `unreadable line "${line.text}"`);
      index++;
      if (groups.value === undefined) {
        const nextLine = lines[index];
        const isNested =
          nextLine !== undefined &&
          (nextLine.indent > indent || (nextLine.indent === indent && SEQUENCE_ITEM_REGEX.test(nextLine.text)));
        entries.push([groups.key, isNested ? parseBlock(nextLine.indent) : undefined]);
      } else entries.push([groups.key, parseValue(groups.value)]);
    }
    return Object.fromEntries(entries);
  };
  const document = parseBlock(lines[0]?.indent ?? 0);
  const unreadLine = lines[index];
  if (unreadLine !== undefined)
    throw new InvalidOperationError(Operation.Read, parseGcsimYaml.name, `unreadable line "${unreadLine.text}"`);
  return document;
};
