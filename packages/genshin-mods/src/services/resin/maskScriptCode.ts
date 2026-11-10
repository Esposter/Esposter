import { MaskFrame } from "../../models/MaskFrame";

// A quoted string's whole literal, escapes read, which a line ending before its closing quote fails to match
const STRING_LITERAL_REGEX = /'(?:[^'\\\n]|\\[\s\S])*'|"(?:[^"\\\n]|\\[\s\S])*"/uy;
// The template text from a position, up to its closing backtick or an interpolation's `${`
const TEMPLATE_TEXT_REGEX = /(?:\\[\s\S]|\$(?!\{)|[^`\\$])*/uy;

// The script with every string body, template text and comment blanked, so the scan reads only code at the same
// Positions. Undefined when the script holds a construct the scan cannot be sure of: a slash, which may open a regular
// Expression, a backslash outside a string, an HTML-style comment, or any literal or comment left open
export const maskScriptCode = (script: string): string | undefined => {
  // Each open interpolation holds its count of open braces, and a template's text is the frame MaskFrame.Template
  const frames: (MaskFrame | number)[] = [];
  // The span of the script each literal body or comment covers, in reading order, blanked in one pass below
  const spans: [number, number][] = [];
  let index = 0;
  while (index < script.length) {
    const frame = frames.at(-1);
    const character = script.charAt(index);
    if (frame === MaskFrame.Template) {
      TEMPLATE_TEXT_REGEX.lastIndex = index;
      const text = TEMPLATE_TEXT_REGEX.exec(script)?.[0] ?? "";
      spans.push([index, index + text.length]);
      index += text.length;
      if (script.charAt(index) === "`") {
        frames.pop();
        index++;
      } else if (script.startsWith("${", index)) {
        frames.push(0);
        index += 2;
      } else return undefined;
    } else if (character === "'" || character === '"') {
      STRING_LITERAL_REGEX.lastIndex = index;
      const literal = STRING_LITERAL_REGEX.exec(script)?.[0];
      if (literal === undefined) return undefined;
      spans.push([index + 1, index + literal.length - 1]);
      index += literal.length;
    } else if (character === "`") {
      frames.push(MaskFrame.Template);
      index++;
    } else if (script.startsWith("//", index)) {
      const end = script.indexOf("\n", index);
      const stop = end === -1 ? script.length : end;
      spans.push([index, stop]);
      index = stop;
    } else if (script.startsWith("/*", index)) {
      const end = script.indexOf("*/", index + 2);
      if (end === -1) return undefined;
      spans.push([index, end + 2]);
      index = end + 2;
    } else if (/[/\\]/u.test(character) || script.startsWith("<!--", index) || script.startsWith("-->", index))
      return undefined;
    else {
      if (typeof frame === "number" && character === "{") frames[frames.length - 1] = frame + 1;
      else if (typeof frame === "number" && character === "}" && frame > 0) frames[frames.length - 1] = frame - 1;
      else if (typeof frame === "number" && character === "}") frames.pop();
      index++;
    }
  }
  if (frames.length > 0) return undefined;
  // A code point outside the BMP is two UTF-16 units, so it blanks to two spaces, which keeps every index
  let code = "";
  let cursor = 0;
  for (const [start, end] of spans) {
    code +=
      script.slice(cursor, start) +
      script.slice(start, end).replaceAll(/[^\n]/gu, (character) => " ".repeat(character.length));
    cursor = end;
  }
  return code + script.slice(cursor);
};
