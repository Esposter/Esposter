import type { ESTree, Plugin } from "@oxlint/plugins";

import { definePlugin, defineRule } from "@oxlint/plugins";
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
const MESSAGE =
  'A union of string literals is an enum — declare `enum Foo { Bar = "bar" }` in its own model file and reference it. See the typescript skill.';

const checkIsStringLiteralType = (type: ESTree.TSType): boolean =>
  type.type === "TSLiteralType" && type.literal.type === "Literal" && typeof type.literal.value === "string";

const stringLiteralUnionRule = defineRule({
  create(context) {
    // Oxlint hands a union inside a type annotation to the visitor twice, so a report is keyed by where it starts
    const reportedStarts = new Set<number>();
    return {
      TSUnionType(node) {
        if (reportedStarts.has(node.start)) return;
        // A parenthesised union is the same argument: `Record<("a" | "b"), T>` is still a set of keys
        let parent = node.parent;
        while (parent.type === "TSParenthesizedType") parent = parent.parent;
        if (parent.type === "TSTypeParameterInstantiation") return;
        const stringLiteralCount = node.types.filter((type) => checkIsStringLiteralType(type)).length;
        if (stringLiteralCount < 2) return;
        reportedStarts.add(node.start);
        context.report({ message: MESSAGE, node });
      },
    };
  },
  meta: { type: "suggestion" },
});

const plugin: Plugin = definePlugin({
  meta: { name: "literal-union" },
  rules: { "no-string-literal-union": stringLiteralUnionRule },
});

export default plugin;
