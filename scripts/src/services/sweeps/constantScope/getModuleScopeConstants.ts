import type { CodeToken } from "#src/models/sweeps/CodeToken";
import type { ModuleScopeConstant } from "#src/models/sweeps/constantScope/ModuleScopeConstant";

import { scanCode } from "#src/services/sweeps/scanCode";

// Anchored at column zero with no leading-space alternative: that is what scopes the scan to module scope,
// Since the formatter indents every declaration a `describe` callback holds
const DECLARATION_REGEX = /^(?:const|let)\s+(?<name>[\w$]+)\s*[:=]/u;
// A hoisted factory reads its bindings from above the imports, where a `describe` scope is invisible
const MOCK_REGEX = /^vi\.mock\(/u;
// Matched on a word boundary, or `functionFactory()` would be exempted by its prefix alone
const FUNCTION_BODY_REGEX = /^(?:async\s+)?function\b/u;
// Anywhere in the initializer, not only at its start: `new Set(await readdir())` is a top-level await too
const AWAIT_REGEX = /\bawait\b/u;

const getReferenceRegex = (name: string): RegExp => new RegExp(String.raw`\b${name.replaceAll("$", "\\$")}\b`, "u");

// The code the tokens spell, with a space wherever the scanner skipped something — a bracket, a string — so two
// Words it kept from either side never rejoin: `new Set(await …)` must read `Set await`, not `Setawait`
const getCode = (tokens: CodeToken[]): string =>
  tokens
    .map(([character, , index], position) => {
      const previous = tokens[position - 1];
      return previous !== undefined && previous[2] + 1 < index ? ` ${character}` : character;
    })
    .join("")
    .trim();

// The statement starting at `offset`, as its code tokens up to and including the first `;` genuinely at depth
// Zero, which is where it ends. One lazy pass: the scan stops at that semicolon rather than reading to the end
// Of the file, and rescanning a growing prefix once per line the statement spans would read a k-line statement
// K times over
const getStatementTokens = (text: string, offset: number): CodeToken[] => {
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
// Its whole text, and the exemptions are what cannot move into a `describe` callback rather than what looks
// Tidy: a function, a hoisted block, a top-level await — and whatever one of those reads, since a binding a
// `vi.mock` factory returns or an awaited initializer names is pinned out there by its reader, transitively.
export const getModuleScopeConstants = (text: string): ModuleScopeConstant[] => {
  const lines = text.split("\n");
  // A helper file holds module state by design — it exports one helper and parks a `describe.todo` beside it
  if (lines.some((line) => line.startsWith("describe.todo("))) return [];

  const candidates: (ModuleScopeConstant & { body: string })[] = [];
  // The code of every statement that pins what it names at module scope
  let pinningBodies: string[] = [];
  let index = 0;
  let offset = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    const name = DECLARATION_REGEX.exec(line)?.groups?.name;
    const isMock = MOCK_REGEX.test(line);
    if (name === undefined && !isMock) {
      index += 1;
      offset += line.length + 1;
      continue;
    }

    const tokens = getStatementTokens(text, offset);
    // A statement nothing terminates runs to the end of the file, trailing comment included: stopping at its
    // Last code token would hand the comment's lines back to the loop, which reads a `const` inside one as a
    // Declaration
    const terminator = tokens.at(-1);
    const length = terminator?.[0] === ";" && terminator[1] === 0 ? terminator[2] : text.length - offset - 1;
    const statement = text.slice(offset, offset + length + 1);
    // A mock statement is read whole; a declaration from its initializer, which an unassigned `let` lacks
    const assignment = tokens.findIndex(([character, depth]) => character === "=" && depth === 0);
    const after = isMock ? tokens : tokens.slice(assignment === -1 ? tokens.length : assignment + 1);
    const body = getCode(after);
    const isArrow = after.some(
      ([character, depth], position) =>
        character === "=" && depth === 0 && after[position + 1]?.[0] === ">" && after[position + 1]?.[1] === 0,
    );
    if (isMock) pinningBodies.push(body);
    // `vi.hoisted` is lifted above the imports, so a `describe` scope cannot hold it
    else if (!isArrow && !statement.includes("vi.hoisted") && !FUNCTION_BODY_REGEX.test(body)) {
      if (AWAIT_REGEX.test(body)) pinningBodies.push(body);
      else if (name !== undefined) candidates.push({ body, line: index + 1, name });
    }
    // The statement's last line is consumed whole, so a statement sharing it is never read as a declaration
    const lineCount = statement.split("\n").length;
    for (const consumedLine of lines.slice(index, index + lineCount)) offset += consumedLine.length + 1;
    index += lineCount;
  }

  // A pinned constant pins what its own initializer reads, so the closure is taken to a fixed point
  const pinnedNames = new Set<string>();
  while (pinningBodies.length > 0) {
    const newlyPinned = candidates.filter(
      ({ name }) =>
        !pinnedNames.has(name) && pinningBodies.some((pinningBody) => getReferenceRegex(name).test(pinningBody)),
    );
    for (const { name } of newlyPinned) pinnedNames.add(name);
    pinningBodies = newlyPinned.map(({ body }) => body);
  }
  return candidates.filter(({ name }) => !pinnedNames.has(name)).map(({ line, name }) => ({ line, name }));
};
