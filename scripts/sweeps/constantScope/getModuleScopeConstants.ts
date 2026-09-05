import type { ModuleScopeConstant } from "#scripts/sweeps/constantScope/models/ModuleScopeConstant";

import { scanCode } from "#scripts/sweeps/constantScope/scanCode";

const DECLARATION_REGEX = /^(?:const|let)\s+(?<name>[\w$]+)\s*[:=]/u;
// Matched on a word boundary, or `awaitable()` and `functionFactory()` would be exempted by their prefixes alone
const EXEMPT_BODY_REGEX = /^(?:await|function)\b/u;

// A declaration ends at the first `;` genuinely at depth zero — the last non-space token of the text so far
const checkIsTerminated = (text: string) => {
  const last = [...scanCode(text)].findLast(([character]) => character.trim());
  return last?.[0] === ";" && last[1] === 0;
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

  while (index < lines.length) {
    const name = DECLARATION_REGEX.exec(lines[index] ?? "")?.groups?.name;
    if (name === undefined) {
      index += 1;
      continue;
    }

    let end = index;
    while (end < lines.length && !checkIsTerminated(lines.slice(index, end + 1).join("\n"))) end += 1;

    const declaration = lines.slice(index, end + 1).join("\n");
    const tokens = [...scanCode(declaration)];
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
    index = end + 1;
  }

  return constants;
};
