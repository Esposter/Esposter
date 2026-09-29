import type { Plugin } from "@oxlint/plugins";

import { noFakedBatchTimer } from "#src/services/oxlint/testing/noFakedBatchTimer";
import { definePlugin } from "@oxlint/plugins";

// An oxlint JS plugin enforcing the testing skill's timer rule for suites that answer tRPC at the network: fake timers
// There name what they fake, and never `setTimeout`, which tRPC's batch link dispatches on.
//
// It reads a file's imports for `setupMswTrpc`'s module and, in a file that has it, every `vi.useFakeTimers` call —
// Reporting one with no `toFake` list, since the default set fakes `setTimeout`, and one whose list names it.
//
// Scoped by `overrides` in the root oxlint.config.ts to `**/*.test.ts`: only a suite calls `setupMswTrpc`.
const plugin: Plugin = definePlugin({
  meta: { name: "testing" },
  rules: { "no-faked-batch-timer": noFakedBatchTimer },
});

export default plugin;
