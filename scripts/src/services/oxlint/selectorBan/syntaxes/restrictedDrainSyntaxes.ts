import type { SelectorBanList } from "#src/models/oxlint/selectorBan/SelectorBanList";

// The app's shared setup drains every test's leftover fire-and-forget after it, so a drain that is a test's last
// Statement reads nothing and is the same drain again. A drain in a suite's own after hook is left alone: one that must
// Land before an earlier hook, as the request harness's late-request check, runs ahead of the setup's. A package's
// Suites have no such setup, so the list is the app's alone
export const RESTRICTED_DRAIN_SYNTAXES: SelectorBanList = {
  bans: [
    {
      message:
        "The app's shared setup drains every test's fire-and-forget after it (`apps/web/shared/test/setup.ts`), so drain only before an assertion that reads the work's effect. See the testing skill's polling page.",
      selector:
        "CallExpression:matches([callee.name='it'], [callee.name='test'], [callee.object.name='it'], [callee.object.name='test']) > :function > BlockStatement > ExpressionStatement:last-child > AwaitExpression > CallExpression[callee.name='waitForSynchronizedFunctions']",
    },
  ],
  files: ["apps/web/**/*.test.ts"],
};
