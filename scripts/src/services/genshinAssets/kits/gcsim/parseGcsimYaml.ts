import type { GcsimYamlLine } from "#src/models/genshinAssets/kits/gcsim/GcsimYamlLine";

import { FLOW_START_REGEX } from "#src/services/genshinAssets/kits/gcsim/constants";
import { parseValue } from "#src/services/genshinAssets/kits/gcsim/parseValue";
import { stripComment } from "#src/services/genshinAssets/kits/gcsim/stripComment";
import { InvalidOperationError, Operation } from "@esposter/shared";

const KEY_REGEX = /^(?<key>[^\s"#'[{-][^:]*?):(?:\s+(?<value>.*))?$/u;
const SEQUENCE_ITEM_REGEX = /^-(?:\s+(?<item>.*))?$/u;

// The subset of YAML gcsim's character configs are written in: block mappings and sequences by indentation, a sequence
// Item opening a mapping or a sequence on its own line, flow collections, on a key's line or below it, plain and quoted
// Scalars, wrapped over lines as YAML folds them, and comments.
// Anything past that, an anchor, a tag or a block scalar, is refused rather than read wrong
export const parseGcsimYaml = (yaml: string): unknown => {
  const lines: GcsimYamlLine[] = [];
  let blankLines = 0;
  for (const rawLine of yaml.split("\n")) {
    const text = stripComment(rawLine).trimEnd();
    const trimmedText = text.trimStart();
    if (trimmedText !== "") {
      lines.push({ blankLines, indent: text.length - trimmedText.length, text: trimmedText });
      blankLines = 0;
    } else if (rawLine.trim() === "") blankLines++;
  }
  let index = 0;
  // A value's continuation lines are the lines after it more indented than the line it starts on and neither a key nor a
  // Sequence item; YAML folds them into the value with one space, or with a newline for each blank line between them, so
  // A plain scalar wrapped over lines reads as one
  const readValue = (text: string, lineIndent: number): unknown => {
    let folded = text;
    for (
      let line = lines[index];
      line !== undefined &&
      line.indent > lineIndent &&
      !KEY_REGEX.test(line.text) &&
      !SEQUENCE_ITEM_REGEX.test(line.text);
      line = lines[index]
    ) {
      folded += line.blankLines === 0 ? " " : "\n".repeat(line.blankLines);
      folded += line.text;
      index++;
    }
    return parseValue(folded);
  };
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
          lines[index] = { blankLines: line.blankLines, indent: indent + line.text.length - item.length, text: item };
          items.push(parseBlock(indent + line.text.length - item.length));
        } else {
          index++;
          items.push(readValue(item, indent));
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
        // A plain scalar wrapped over the lines below its key, which the key's indent is the one it folds into
        if (
          nextLine !== undefined &&
          nextLine.indent > indent &&
          !FLOW_START_REGEX.test(nextLine.text) &&
          !KEY_REGEX.test(nextLine.text) &&
          !SEQUENCE_ITEM_REGEX.test(nextLine.text)
        ) {
          index++;
          entries.push([groups.key, readValue(nextLine.text, indent)]);
          continue;
        }
        const isNested =
          nextLine !== undefined &&
          (nextLine.indent > indent || (nextLine.indent === indent && SEQUENCE_ITEM_REGEX.test(nextLine.text)));
        entries.push([groups.key, isNested ? parseBlock(nextLine.indent) : undefined]);
      } else entries.push([groups.key, readValue(groups.value, indent)]);
    }
    return Object.fromEntries(entries);
  };
  const document = parseBlock(lines[0]?.indent ?? 0);
  const unreadLine = lines[index];
  if (unreadLine !== undefined)
    throw new InvalidOperationError(Operation.Read, parseGcsimYaml.name, `unreadable line "${unreadLine.text}"`);
  return document;
};
