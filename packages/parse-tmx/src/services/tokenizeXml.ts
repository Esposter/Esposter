import type { XmlHandlers } from "#src/models/xml/XmlHandlers";

import { InvalidOperationError, Operation } from "@esposter/shared";

const BYTE_ORDER_MARK = "\uFEFF";
const LINE_ENDING_REGEX = /\r\n?/gu;
// XML 1.0's Char production: any character outside it, a lone surrogate included, makes the document malformed
const INVALID_CHARACTER_REGEX = /[^\t\n\r\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/u;
// XML 1.0's Name production, read where the cursor stands
const NAME_REGEX =
  /[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}][-.0-9:A-Z_a-z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}]*/uy;
const WHITESPACE_REGEX = /[\t\n ]*/uy;
const ONLY_WHITESPACE_REGEX = /^[\t\n ]*$/u;
const ATTRIBUTE_WHITESPACE_REGEX = /[\t\n]/gu;
const DECIMAL_REFERENCE_REGEX = /^#[0-9]+$/u;
const HEXADECIMAL_REFERENCE_REGEX = /^#x[0-9A-Fa-f]+$/u;
// Attribute-value normalisation: each literal whitespace character reads as a space, a referenced one as itself
const normaliseAttributeValue = (literal: string): string => literal.replaceAll(ATTRIBUTE_WHITESPACE_REGEX, " ");
const PredefinedEntityMap = new Map([
  ["amp", "&"],
  ["apos", "'"],
  ["gt", ">"],
  ["lt", "<"],
  ["quot", '"'],
]);

// One pass over a whole XML 1.0 document, strict as the standard's well-formedness rules are, telling the handlers what
// It reads. Line endings are normalised before the pass, as the standard has a processor do, so every position counts
// Lines by "\n". Comments, processing instructions, the XML declaration and a DOCTYPE are read past; references are the
// Five predefined entities and character references, and any other is refused. The first malformed construct throws,
// Naming its line and column, both counted from one.
export const tokenizeXml = (input: string, { onCloseTag, onOpenTag, onText }: XmlHandlers): void => {
  const xml = (input.startsWith(BYTE_ORDER_MARK) ? input.slice(BYTE_ORDER_MARK.length) : input).replaceAll(
    LINE_ENDING_REGEX,
    "\n",
  );
  const fail: (reason: string, index: number) => never = (reason, index) => {
    const before = xml.slice(0, index);
    const line = before.split("\n").length;
    const column = index - before.lastIndexOf("\n");
    throw new InvalidOperationError(Operation.Read, tokenizeXml.name, `${reason} at line ${line}, column ${column}`);
  };
  const invalidCharacter = INVALID_CHARACTER_REGEX.exec(xml);
  if (invalidCharacter) fail("has a character XML does not allow", invalidCharacter.index);

  const readName = (index: number): string => {
    NAME_REGEX.lastIndex = index;
    return NAME_REGEX.exec(xml)?.[0] ?? fail("expects a name", index);
  };
  const skipWhitespace = (index: number): number => {
    WHITESPACE_REGEX.lastIndex = index;
    WHITESPACE_REGEX.test(xml);
    return WHITESPACE_REGEX.lastIndex;
  };
  // A reference resolves to its character; a character reference must name a character XML allows
  const decodeReferences = (text: string, start: number, normalise: (literal: string) => string): string => {
    let decoded = "";
    let literalStart = 0;
    for (let ampersand = text.indexOf("&"); ampersand !== -1; ampersand = text.indexOf("&", literalStart)) {
      const semicolon = text.indexOf(";", ampersand);
      const reference = semicolon === -1 ? "" : text.slice(ampersand + 1, semicolon);
      let character = PredefinedEntityMap.get(reference);
      if (character === undefined) {
        const codePoint = DECIMAL_REFERENCE_REGEX.test(reference)
          ? Math.trunc(Number(reference.slice(1)))
          : HEXADECIMAL_REFERENCE_REGEX.test(reference)
            ? Number.parseInt(reference.slice(2), 16)
            : Number.NaN;
        character = codePoint <= 0x10_ff_ff ? String.fromCodePoint(codePoint) : "";
        if (!character || INVALID_CHARACTER_REGEX.test(character))
          fail(`has a reference XML does not define: &${reference}`, start + ampersand);
      }
      decoded += normalise(text.slice(literalStart, ampersand)) + character;
      literalStart = semicolon + 1;
    }
    return decoded + normalise(text.slice(literalStart));
  };
  const readCharacterData = (text: string, start: number): string => {
    const cdataEnd = text.indexOf("]]>");
    if (cdataEnd !== -1) fail("has ]]> in its character data", start + cdataEnd);
    return text.includes("&") ? decodeReferences(text, start, (literal) => literal) : text;
  };

  const openNames: string[] = [];
  let hasRoot = false;
  let index = 0;
  while (index < xml.length) {
    const tagStart = xml.indexOf("<", index);
    const textEnd = tagStart === -1 ? xml.length : tagStart;
    if (textEnd > index) {
      const text = xml.slice(index, textEnd);
      if (openNames.length > 0) onText(readCharacterData(text, index));
      else if (!ONLY_WHITESPACE_REGEX.test(text)) fail("has text outside the root element", index);
    }
    if (tagStart === -1) break;

    if (xml.startsWith("<?", tagStart)) {
      const end = xml.indexOf("?>", tagStart + 2);
      if (end === -1) fail("has a processing instruction with no end", tagStart);
      const target = readName(tagStart + 2);
      if (target.toLowerCase() === "xml" && (target !== "xml" || tagStart !== 0))
        fail("has an XML declaration that is not the document's start", tagStart);
      index = end + 2;
    } else if (xml.startsWith("<!--", tagStart)) {
      const end = xml.indexOf("-->", tagStart + 4);
      if (end === -1) fail("has a comment with no end", tagStart);
      const doubleHyphen = xml.indexOf("--", tagStart + 4);
      if (doubleHyphen < end) fail("has -- inside a comment", doubleHyphen);
      index = end + 3;
    } else if (xml.startsWith("<![CDATA[", tagStart)) {
      if (openNames.length === 0) fail("has a CDATA section outside the root element", tagStart);
      const end = xml.indexOf("]]>", tagStart + 9);
      if (end === -1) fail("has a CDATA section with no end", tagStart);
      onText(xml.slice(tagStart + 9, end));
      index = end + 3;
    } else if (xml.startsWith("<!DOCTYPE", tagStart)) {
      if (hasRoot) fail("has a DOCTYPE after the root element", tagStart);
      // The declaration ends at the first > outside its quoted literals and its internal subset, where a comment or a
      // Processing instruction is read past whole, as a quote inside one opens no literal
      let depth = 0;
      let quote = "";
      let cursor = tagStart + 9;
      for (; cursor < xml.length; cursor++) {
        const character = xml[cursor];
        if (quote) {
          if (character === quote) quote = "";
        } else if (xml.startsWith("<!--", cursor) || xml.startsWith("<?", cursor)) {
          const terminator = xml[cursor + 1] === "?" ? "?>" : "-->";
          const end = xml.indexOf(terminator, cursor + 2);
          // The loop's step moves past the terminator's last character
          cursor = end === -1 ? xml.length - 1 : end + terminator.length - 1;
        } else if (character === '"' || character === "'") quote = character;
        else if (character === "[") depth++;
        else if (character === "]") depth--;
        else if (character === ">" && depth === 0) break;
      }
      if (cursor === xml.length) fail("has a DOCTYPE with no end", tagStart);
      index = cursor + 1;
    } else if (xml.startsWith("</", tagStart)) {
      const name = readName(tagStart + 2);
      const end = skipWhitespace(tagStart + 2 + name.length);
      if (xml[end] !== ">") fail(`expects > to close </${name}`, end);
      const openName = openNames.pop();
      if (openName !== name)
        fail(openName ? `closes <${openName}> with </${name}>` : `closes </${name}> with no element open`, tagStart);
      onCloseTag(name);
      index = end + 1;
    } else {
      if (hasRoot && openNames.length === 0) fail("has a second root element", tagStart);
      const name = readName(tagStart + 1);
      const entries: [string, string][] = [];
      const attributeNames = new Set<string>();
      let cursor = tagStart + 1 + name.length;
      for (;;) {
        const afterWhitespace = skipWhitespace(cursor);
        if (xml.startsWith("/>", afterWhitespace) || xml[afterWhitespace] === ">") {
          cursor = afterWhitespace;
          break;
        }
        if (afterWhitespace === xml.length) fail(`leaves the tag <${name}> with no end`, tagStart);
        if (afterWhitespace === cursor) fail(`expects whitespace before an attribute of <${name}>`, cursor);
        const attributeName = readName(afterWhitespace);
        if (attributeNames.has(attributeName)) fail(`repeats the attribute ${attributeName}`, afterWhitespace);
        const equals = skipWhitespace(afterWhitespace + attributeName.length);
        if (xml[equals] !== "=") fail(`expects = after the attribute ${attributeName}`, equals);
        const valueStart = skipWhitespace(equals + 1);
        const quote = xml[valueStart];
        if (quote !== '"' && quote !== "'")
          fail(`expects a quoted value for the attribute ${attributeName}`, valueStart);
        const valueEnd = xml.indexOf(quote, valueStart + 1);
        if (valueEnd === -1) fail(`has an unterminated value for the attribute ${attributeName}`, valueStart);
        const value = xml.slice(valueStart + 1, valueEnd);
        if (value.includes("<")) fail(`has < in the attribute ${attributeName}`, valueStart + 1 + value.indexOf("<"));
        attributeNames.add(attributeName);
        entries.push([
          attributeName,
          value.includes("&")
            ? decodeReferences(value, valueStart + 1, normaliseAttributeValue)
            : normaliseAttributeValue(value),
        ]);
        cursor = valueEnd + 1;
      }
      hasRoot = true;
      onOpenTag(name, Object.fromEntries(entries));
      if (xml.startsWith("/>", cursor)) {
        onCloseTag(name);
        index = cursor + 2;
      } else {
        openNames.push(name);
        index = cursor + 1;
      }
    }
  }

  const unclosedName = openNames.at(-1);
  if (unclosedName) fail(`leaves <${unclosedName}> unclosed`, xml.length);
  if (!hasRoot) fail("has no root element", xml.length);
};
