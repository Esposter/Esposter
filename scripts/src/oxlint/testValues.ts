import type { Plugin } from "@oxlint/plugins";

import { noTypedDate } from "#src/services/oxlint/testValues/noTypedDate";
import { definePlugin } from "@oxlint/plugins";

// An oxlint JS plugin enforcing the test-values skill's date rule: every date in a suite is computed from the
// Epoch, none is typed.
//
// It reads four shapes and nothing else: a string carrying a calendar date outside 1970, wherever it sits; a
// String handed to `new Date`, whatever it carries; a string handed to a `Temporal` date type's `from`; and the
// Local-parts form `new Date(year, month, …)` with a year that is not 1970. The one year it lets through is the
// Skill's own exception — a value a parser or formatter reads by its shape stays in the epoch's own year — and
// The Temporal type names are the library's vocabulary, so nothing here is a list the repo can outgrow.
//
// Scoped by `overrides` in the root .oxlintrc.json to `**/*.test.ts`, `**/*.test-d.ts` and `**/*.bench.ts`:
// The skill's domain is the values a suite writes, and a production date is data.
const plugin: Plugin = definePlugin({ meta: { name: "test-values" }, rules: { "no-typed-date": noTypedDate } });

export default plugin;
