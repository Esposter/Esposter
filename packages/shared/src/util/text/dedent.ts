import type { Dedent } from "#src/models/text/Dedent";
import type { DedentOptions } from "#src/models/text/DedentOptions";

interface Character {
  escapable: boolean;
  value: string;
}

interface Cooked {
  length: number;
  text: string;
}

const ESCAPE_CHARACTER = "\\";
const LINE_FEED = "\n";
const LINE_FEED_CHARACTER: Character = { escapable: false, value: LINE_FEED };
const HEXADECIMAL_REGEX = /^[\da-fA-F]$/u;
const WHITESPACE_REGEX = /^\s$/u;
const BRACED_CODE_POINT_MAXIMUM_DIGITS = 6;
const CODE_POINT_MAXIMUM = 0x10ffff;
const HEXADECIMAL_BYTE_DIGITS = 2;
const HEXADECIMAL_UNIT_DIGITS = 4;
// Only the escapes a template author writes on purpose; anything else such as `\}` is kept as typed
const escapeValueMap: Record<string, string> = {
  "0": "\0",
  $: "$",
  "\\": "\\",
  "`": "`",
  b: "\b",
  f: "\f",
  n: "\n",
  r: "\r",
  t: "\t",
  v: "\v",
  "{": "{",
};

const toCharacters = (text: string, escapable: boolean): Character[] =>
  text.split("").map((value) => ({ escapable, value }));

const isWhitespace = (character: Character) => WHITESPACE_REGEX.test(character.value);

const alignValue = (value: string, precedingText: string) => {
  const currentLine = precedingText.slice(precedingText.lastIndexOf(LINE_FEED) + 1);
  const indentation = /^\s+/u.exec(currentLine)?.[0];

  return indentation ? value.replaceAll(LINE_FEED, `${LINE_FEED}${indentation}`) : value;
};

// A backslash only escapes what the template wrote itself, so a backslash inside a value is never one
const isEscapeStart = (characters: Character[], index: number) => {
  const character = characters[index];
  const next = characters[index + 1];

  return character?.escapable === true && character.value === ESCAPE_CHARACTER && next?.escapable === true;
};

// A backslash before a newline joins the next line and takes that line's leading blanks with it
const removeLineContinuations = (characters: Character[]) => {
  const result: Character[] = [];
  let index = 0;

  while (index < characters.length) {
    const character = characters[index];
    if (!character) break;

    if (isEscapeStart(characters, index)) {
      const next = characters[index + 1];
      if (next?.value === LINE_FEED) {
        index += 2;
        while (
          characters[index]?.escapable === true &&
          (characters[index]?.value === " " || characters[index]?.value === "\t")
        )
          index++;
      } else {
        result.push(character, ...(next ? [next] : []));
        index += 2;
      }
    } else {
      result.push(character);
      index++;
    }
  }

  return result;
};

const splitLines = (characters: Character[]) => {
  const lines: Character[][] = [];
  let line: Character[] = [];

  for (const character of characters)
    if (character.value === LINE_FEED) {
      lines.push(line);
      line = [];
    } else line.push(character);

  lines.push(line);

  return lines;
};

// A line only counts toward the indentation when it has text after its leading whitespace
const getIndentation = (line: Character[]) => {
  const indentation = line.findIndex((character) => !isWhitespace(character));

  return indentation > 0 ? indentation : undefined;
};

const dedentCharacters = (characters: Character[]) => {
  const lines = splitLines(characters);
  const indentations = lines.map((line) => getIndentation(line)).filter((indentation) => indentation !== undefined);
  if (indentations.length === 0) return characters;

  const minimumIndentation = Math.min(...indentations);

  const result: Character[] = [];
  for (const [index, line] of lines.entries()) {
    if (index > 0) result.push(LINE_FEED_CHARACTER);

    const first = line[0]?.value;
    result.push(...(first === " " || first === "\t" ? line.slice(minimumIndentation) : line));
  }

  return result;
};

const trimCharacters = (characters: Character[]) => {
  const start = characters.findIndex((character) => !isWhitespace(character));
  if (start === -1) return [];

  return characters.slice(start, characters.findLastIndex((character) => !isWhitespace(character)) + 1);
};

const readHexadecimal = (characters: Character[], start: number, digits: number) => {
  let hexadecimal = "";

  for (let index = start; index < start + digits; index++) {
    const character = characters[index];
    if (character?.escapable !== true || !HEXADECIMAL_REGEX.test(character.value)) return undefined;

    hexadecimal += character.value;
  }

  return hexadecimal;
};

// Reads `\u{...}` whose backslash is at `index`, returning undefined unless it is a complete code point
const readBracedCodePoint = (characters: Character[], index: number): Cooked | undefined => {
  if (characters[index + 2]?.value !== "{") return undefined;

  let digits = "";
  let cursor = index + 3;
  while (digits.length < BRACED_CODE_POINT_MAXIMUM_DIGITS && HEXADECIMAL_REGEX.test(characters[cursor]?.value ?? "")) {
    digits += characters[cursor]?.value;
    cursor++;
  }

  const closing = characters[cursor];
  if (digits.length === 0 || closing?.escapable !== true || closing.value !== "}") return undefined;

  const codePoint = Number.parseInt(digits, 16);
  if (codePoint > CODE_POINT_MAXIMUM) return undefined;

  return { length: cursor - index + 1, text: String.fromCodePoint(codePoint) };
};

const readEscape = (characters: Character[], index: number): Cooked => {
  const character = characters[index];
  if (!character) return { length: 0, text: "" };
  if (!isEscapeStart(characters, index)) return { length: 1, text: character.value };

  const next = characters[index + 1];
  const escapeValue = next ? escapeValueMap[next.value] : undefined;
  if (escapeValue !== undefined) return { length: 2, text: escapeValue };

  if (next?.value === "x") {
    const hexadecimal = readHexadecimal(characters, index + 2, HEXADECIMAL_BYTE_DIGITS);
    if (hexadecimal !== undefined)
      return { length: 2 + HEXADECIMAL_BYTE_DIGITS, text: String.fromCodePoint(Number.parseInt(hexadecimal, 16)) };
  }

  if (next?.value === "u") {
    const braced = readBracedCodePoint(characters, index);
    if (braced) return braced;

    const hexadecimal = readHexadecimal(characters, index + 2, HEXADECIMAL_UNIT_DIGITS);
    if (hexadecimal !== undefined)
      return { length: 2 + HEXADECIMAL_UNIT_DIGITS, text: String.fromCodePoint(Number.parseInt(hexadecimal, 16)) };
  }

  return { length: 1, text: character.value };
};

const cookCharacters = (characters: Character[]) => {
  let result = "";
  let index = 0;

  while (index < characters.length) {
    const cooked = readEscape(characters, index);
    result += cooked.text;
    index += cooked.length;
  }

  return result;
};

const createDedent = (options: DedentOptions): Dedent => {
  const dedent = (strings: string | TemplateStringsArray, ...values: unknown[]) => {
    const isTemplate = typeof strings !== "string";
    const raws = isTemplate ? strings.raw : [strings];
    const { alignValues = false, escapeSpecialCharacters = isTemplate, trimWhitespace = true } = options;

    let precedingText = "";
    const parts: Character[][] = [];
    for (const [index, raw] of raws.entries()) {
      parts.push(toCharacters(raw, true));
      precedingText += raw;

      if (index < values.length) {
        const value = String(values[index]);
        const alignedValue = alignValues ? alignValue(value, precedingText) : value;
        parts.push(toCharacters(alignedValue, false));
        precedingText += alignedValue;
      }
    }

    let characters = parts.flat();
    if (escapeSpecialCharacters) characters = removeLineContinuations(characters);

    characters = dedentCharacters(characters);
    if (trimWhitespace) characters = trimCharacters(characters);

    return escapeSpecialCharacters
      ? cookCharacters(characters)
      : characters.map((character) => character.value).join("");
  };

  dedent.withOptions = (newOptions: DedentOptions) => createDedent({ ...options, ...newOptions });

  return dedent;
};

export const dedent: Dedent = createDedent({});
