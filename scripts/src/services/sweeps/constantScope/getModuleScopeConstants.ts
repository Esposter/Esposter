import type { CodeToken } from "#src/models/sweeps/CodeToken";
import type { ModuleScopeConstant } from "#src/models/sweeps/constantScope/ModuleScopeConstant";

import { scanCode } from "#src/sweeps/scanCode";

// Anchored at column zero with no leading-space alternative: that is what scopes the scan to module scope,
// Since the formatter indents every declaration a `describe` callback holds
const DECLARATION_REGEX = /^(?:const|let)\s+(?<name>[\w$]+)\s*[:=]/u;
// Matched on a word boundary, or `awaitable()` and `functionFactory()` would be exempted by their prefixes alone
const EXEMPT_BODY_REGEX = /^(?:await|(?:async\s+)?function)\b/u;

// The declaration starting at `offset`, as its code tokens up to and including the first `;` genuinely at depth
// Zero, which is where it ends. One lazy pass: the scan stops at that semicolon rather than reading to the end
// Of the file, and rescanning a growing prefix once per line the declaration spans would read a k-line
// Declaration k times over
const getDeclarationTokens = (text: string, offset: number): CodeToken[] => {
  const tokens: CodeToken[] = [];
  for (const token of scanCode(text.slice(offset))) {
    tokens.push(token);
    if (token[0] === ";" && token[1] === 0) break;
  }
  return tokens;
};

// Module-scope state in a test file, which a sibling suite can reach and mutate — the `testing` skill's scope
// Rule. A line-anchored regex cannot decide this on its own: it reads a multi-line arrow as a constant, because
// The `=>` lands on a later line, and it cannot tell where a declaration ends. So a statement is classified by
// Its whole text, and the exemptions are what cannot move into a `describe` callback rather than what looks tidy.
export const getModuleScopeConstants = (text: string): ModuleScopeConstant[] => {
  const lines = text.split("\n");
  // A helper file holds module state by design — it exports one helper and parks a `describe.todo` beside it
  if (lines.some((line) => line.startsWith("describe.todo("))) return [];

  const constants: ModuleScopeConstant[] = [];
  let index = 0;
  let offset = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    const name = DECLARATION_REGEX.exec(line)?.groups?.name;
    if (name === undefined) {
      index += 1;
      offset += line.length + 1;
      continue;
    }

    const tokens = getDeclarationTokens(text, offset);
    // A declaration nothing terminates runs to the end of the file
    const length = tokens.at(-1)?.[2] ?? text.length - offset - 1;
    const declaration = text.slice(offset, offset + length + 1);
    const assignment = tokens.findIndex(([character, depth]) => character === "=" && depth === 0);
    const after = assignment === -1 ? [] : tokens.slice(assignment + 1);
    const body = after
      .map(([character]) => character)
      .join("")
      .trim();
    const isArrow = after.some(
      ([character, depth], position) =>
        character === "=" && depth === 0 && after[position + 1]?.[0] === ">" && after[position + 1]?.[1] === 0,
    );

    // `vi.hoisted` is lifted above the imports, so a `describe` scope cannot hold it
    if (!isArrow && !declaration.includes("vi.hoisted") && !EXEMPT_BODY_REGEX.test(body))
      constants.push({ line: index + 1, name });
    // The declaration's last line is consumed whole, so a statement sharing it is never read as a declaration
    const lineCount = declaration.split("\n").length;
    for (const consumedLine of lines.slice(index, index + lineCount)) offset += consumedLine.length + 1;
    index += lineCount;
  }

  return constants;
};
