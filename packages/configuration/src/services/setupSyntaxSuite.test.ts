import type { SetupSyntaxSuiteOptions } from "#src/models/SetupSyntaxSuiteOptions";
import type { Linter } from "eslint";

import { ESLint } from "eslint";
import { join } from "node:path";
import { beforeAll, describe, expect, test } from "vitest";

// Every ban here is one entry in a list the flat config spreads into one or more overrides, so a fixture is linted
// Through the real app config rather than the entry alone: that is what proves the selector parses, that its
// Override reaches the file kind it names, and that a later override has not replaced it. The config is loaded once
// Per suite, and only the entries under test are counted, so a fixture may break any other rule freely. Only the
// Restricted-syntax rules run at all: the UnoCSS ones load a `uno.config.ts` this package has none of, and throw on
// Any template carrying an attribute.
export const setupSyntaxSuite = ({ entries, fixtures }: SetupSyntaxSuiteOptions): void => {
  const messages = new Set(entries.map(({ message }) => message));
  const fixtureViolationsMap = new Map<string, number>();

  beforeAll(async () => {
    const eslint = new ESLint({
      cwd: join(import.meta.dirname, "..", ".."),
      overrideConfigFile: "eslint/index.vue.js",
      ruleFilter: ({ ruleId }) => ruleId.endsWith("no-restricted-syntax"),
    });
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
