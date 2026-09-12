import type { Plugin } from "@oxlint/plugins";

import { noStringLiteralUnion } from "#src/services/oxlint/literalUnion/noStringLiteralUnion";
import { definePlugin } from "@oxlint/plugins";
// An oxlint JS plugin enforcing the typescript skill's enum rule: a set of string literals is an enum.
//
// A union of two or more string literals is a closed set spelled inline, so every reader of it re-types the
// Members and nothing ties the spellings together — an enum declares the set once, in a model file, and a
// Member is a name the compiler checks. One string literal beside other types is not a set: `"" | Foo` is the
// Empty sentinel the typescript skill allows, and a lone discriminant (`type: "ApiConnection"`) is a single
// Value. Numeric unions (`-1 | 1`) are left alone, since an enum would only rename the numbers, and so is a
// Union passed as a type argument — `Pick<Foo, "a" | "b">` names keys the compiler already checks against `Foo`.
//
// Off for `**/*.d.ts` in the root .oxlintrc.json: an ambient declaration mirrors a library's API, whose unions
// Are the library's to name.
const plugin: Plugin = definePlugin({
  meta: { name: "literal-union" },
  rules: { "no-string-literal-union": noStringLiteralUnion },
});

export default plugin;
