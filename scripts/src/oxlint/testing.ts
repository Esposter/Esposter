import type { Plugin } from "@oxlint/plugins";

import { fakeClockOnly } from "#src/services/oxlint/testing/fakeClockOnly";
import { noFakedSetTimeout } from "#src/services/oxlint/testing/noFakedSetTimeout";
import { definePlugin } from "@oxlint/plugins";

// An oxlint JS plugin enforcing the testing skill's timer rules for suites that do real I/O, each read off a file's
// Imports and checked at every `vi.useFakeTimers` call:
// - `no-faked-set-timeout`, in a suite importing `setupMswTrpc`'s module: fake timers there name what they fake, and
//   Never `setTimeout`, which the harness's afterEach waits one turn on.
// - `fake-clock-only`, in a suite reaching Miniflare: fake timers there fake `Date` or `Temporal` and nothing else,
//   Since Miniflare's bindings run on Node's own timers.
//
// A call with no `toFake` list fakes Vitest's default set, so both report it.
//
// Scoped by `overrides` in the root oxlint.config.ts to `**/*.test.ts`: only a suite imports either module.
const plugin: Plugin = definePlugin({
  meta: { name: "testing" },
  rules: { "fake-clock-only": fakeClockOnly, "no-faked-set-timeout": noFakedSetTimeout },
});

export default plugin;
