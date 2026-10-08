import { describe, expect, test } from "vitest";

import { checkIsLookupCommand } from "./checkIsLookupCommand";

describe(checkIsLookupCommand, () => {
  test.each([
    ["a bare read", "cat README.md"],
    ["a search with a flag", "rg -n foo src"],
    ["a git read", "git log --oneline"],
    ["a node one-liner", 'node -e "console.log(1)"'],
    ["an export and a cd before it", 'export PATH="/x:$PATH" && cd "$W" && cat a.ts'],
    ["a cd ended by a semicolon", 'cd "$W"; grep -r foo .'],
    ["leading whitespace", "  ls -la"],
  ])("counts %s as a lookup", (_description, command) => {
    expect.hasAssertions();

    expect(checkIsLookupCommand(command)).toBe(true);
  });

  test.each([
    ["a word that only starts with a lookup", "catalog build"],
    ["a command that changes the tree", "git commit -m message"],
    ["a git read it does not list", "git status"],
    ["a node script rather than a one-liner", "node script.js"],
    ["a chained command that is not a lookup", 'cd "$W" && pnpm test'],
    ["a lookup named only as an argument", "echo cat"],
  ])("does not count %s as a lookup", (_description, command) => {
    expect.hasAssertions();

    expect(checkIsLookupCommand(command)).toBe(false);
  });
});
