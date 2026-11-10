// A frame the scan is inside: a template literal's text, or an interpolation's code with the braces open in it
type Frame = "template" | number;

// Every character of a literal's or a comment's body becomes a space, so the code left is at the same positions. A code
// point outside the BMP is two UTF-16 units, so it becomes two spaces, not one
const blankBody = (text: string): string => text.replace(/[^\n]/gu, (character) => " ".repeat(character.length));

// The template text from a position, up to its closing backtick or an interpolation's `${`
const TEMPLATE_TEXT_REGEX = /(?:\\[\s\S]|\$(?!\{)|[^`\\$])*/uy;

// The index of the quote closing the string that opens at start, or -1 when a line ends first or none closes it
const findStringEnd = (script: string, start: number): number => {
  const quote = script.charAt(start);
  for (let index = start + 1; index < script.length; index++) {
    const character = script.charAt(index);
    if (character === "\\") index++;
    else if (character === quote) return index;
    else if (character === "\n") return -1;
  }
  return -1;
};

// The script with every string, template text and comment blanked, so the scan reads only code at the same positions.
// Undefined when the script holds a construct the scan cannot be sure of: a slash, which may open a regular expression,
// a backslash outside a string, an HTML-style comment, or any literal or comment left open
export const maskScriptCode = (script: string): string | undefined => {
  const frames: Frame[] = [];
  let code = "";
  let index = 0;
  while (index < script.length) {
    const frame = frames.at(-1);
    const character = script.charAt(index);
    if (frame === "template") {
      TEMPLATE_TEXT_REGEX.lastIndex = index;
      const text = TEMPLATE_TEXT_REGEX.exec(script)?.[0] ?? "";
      code += blankBody(text);
      index += text.length;
      if (script.charAt(index) === "`") {
        frames.pop();
        code += "`";
        index++;
      } else if (script.startsWith("${", index)) {
        frames.push(0);
        code += "${";
        index += 2;
      } else return undefined;
    } else if (character === "'" || character === '"') {
      const end = findStringEnd(script, index);
      if (end === -1) return undefined;
      code += character + blankBody(script.slice(index + 1, end)) + character;
      index = end + 1;
    } else if (character === "`") {
      frames.push("template");
      code += character;
      index++;
    } else if (script.startsWith("//", index)) {
      const end = script.indexOf("\n", index);
      const stop = end === -1 ? script.length : end;
      code += blankBody(script.slice(index, stop));
      index = stop;
    } else if (script.startsWith("/*", index)) {
      const end = script.indexOf("*/", index + 2);
      if (end === -1) return undefined;
      code += blankBody(script.slice(index, end + 2));
      index = end + 2;
    } else if (/[/\\]/u.test(character) || script.startsWith("<!--", index) || script.startsWith("-->", index)) {
      return undefined;
    } else {
      if (typeof frame === "number" && character === "{") frames[frames.length - 1] = frame + 1;
      if (typeof frame === "number" && character === "}") {
        if (frame === 0) frames.pop();
        else frames[frames.length - 1] = frame - 1;
      }
      code += character;
      index++;
    }
  }
  return frames.length === 0 ? code : undefined;
};
