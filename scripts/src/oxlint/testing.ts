import type { Plugin } from "@oxlint/plugins";

import { fakeClockOnly } from "#src/services/oxlint/testing/fakeClockOnly";
import { requireSuite } from "#src/services/oxlint/testing/requireSuite";
import { definePlugin } from "@oxlint/plugins";

// An oxlint JS plugin enforcing the testing skill's timer rule for suites that reach Miniflare, read off a file's
// Imports and checked at every `vi.useFakeTimers` call: `fake-clock-only` holds fake timers there to `Date` or
// `Temporal`, since Miniflare's bindings run on Node's own timers. A call with no `toFake` list fakes Vitest's default
// Set, so it reports that too.
//
// The test-helper rule, `require-suite`, reads a whole file: a `.test.ts` that declares no suite is a helper, and its
// Placeholder is `describe.todo`, the testing skill's test-helper-files page.
//
// Scoped by `overrides` in the root oxlint.config.ts to `**/*.test.ts`: only a suite imports the mock database, and
// Every test file is held to `require-suite`.
const plugin: Plugin = definePlugin({
  meta: { name: "testing" },
  rules: { "fake-clock-only": fakeClockOnly, "require-suite": requireSuite },
});

export default plugin;
