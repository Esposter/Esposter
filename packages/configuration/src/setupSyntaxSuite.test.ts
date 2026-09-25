import type { Linter } from "eslint";

import { ESLint } from "eslint";
import { join } from "node:path";
import { beforeAll, describe, expect, test } from "vitest";

interface SetupSyntaxSuiteOptions {
  // The restricted-syntax entries under test, told apart from every other entry by their message
  entries: { message: string }[];
  fixtures: SyntaxFixture[];
}

interface SyntaxFixture {
  // The fixture's file name under the package, whose extension picks the override that lints it
  filePath: string;
  name: string;
  source: string;
  violations: number;
}
// Every ban here is one entry in a list the flat config spreads into one or more overrides, so a fixture is linted
// Through the real app config rather than the entry alone: that is what proves the selector parses, that its
// Override reaches the file kind it names, and that a later override has not replaced it. The config is loaded once
// Per suite, and only the entries under test are counted, so a fixture may break any other rule freely.
export const setupSyntaxSuite = ({ entries, fixtures }: SetupSyntaxSuiteOptions): void => {
  const messages = new Set(entries.map(({ message }) => message));
  const fixtureViolationsMap = new Map<string, number>();

  beforeAll(async () => {
    const eslint = new ESLint({ cwd: join(import.meta.dirname, ".."), overrideConfigFile: "eslint/index.vue.js" });
    await Promise.all(
      fixtures.map(async ({ filePath, name, source }) => {
        const [result] = await eslint.lintText(`${source}\n`, { filePath });
        const reportedMessages: Linter.LintMessage[] = result?.messages ?? [];
        fixtureViolationsMap.set(name, reportedMessages.filter(({ message }) => messages.has(message)).length);
      }),
    );
  });

  test.each(fixtures)("reports $violations violation(s) for $name", ({ name, violations }) => {
    expect.hasAssertions();

    expect(fixtureViolationsMap.get(name)).toBe(violations);
  });
};

describe.todo("setupSyntaxSuite");
