import type { Plugin } from "@oxlint/plugins";

import { noCountWriteBeforeSettle } from "#src/services/oxlint/countWriteAfterSettle/noCountWriteBeforeSettle";
import { definePlugin } from "@oxlint/plugins";

// An oxlint JS plugin enforcing the client-data rule that a displayed server count holds its value until the write
// That changes it settles, then shows the value the server reads back.
// Design: openspec/specs/architecture/client-data/design.md
//
// The check is purely syntactic and runs in oxlint's single root pass, scoped to the client's `.ts` in the root
// `oxlint.config.ts`. The count fields it matches are the same list the `no-restricted-syntax` selectors read.
const plugin: Plugin = definePlugin({
  meta: { name: "count-write-after-settle" },
  rules: { "no-count-write-before-settle": noCountWriteBeforeSettle },
});

export default plugin;
