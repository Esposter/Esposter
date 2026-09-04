import type { ESTree, Plugin } from "@oxlint/plugins";

import { definePlugin, defineRule } from "@oxlint/plugins";
// Oxlint JS plugin enforcing the SFC props-interface convention (vue/SKILL.md).
//
// A props interface declared inside an SFC is file-scoped, so every word beyond `Props` is a word the file path
// Already spells. Counting those words was previously a judgement call settled per folder, which no linter can
// Check and which therefore drifted; the name is now fixed at `Props` and there is nothing left to decide.
//
// A shape another file reads is a different thing: it moves to its own `.ts` beside the component that owns it,
// Named after its single export the way any other module is. So an SFC exports no type at all, and an import
// Site never has to guess whether a name it reads came from a component or a module.
//
// Both rules are purely syntactic and scoped to `**/*.vue` in the root .oxlintrc.json.
const EXPORTED_TYPE_MESSAGE =
  "An SFC exports no type: a shape read outside this file belongs in its own `.ts` beside the component, named after its single export. Move it there and import it back.";
const INLINE_TYPE_MESSAGE =
  "`defineProps` takes a named type, never an inline object literal — declare `interface Props` above it.";
const PROPS_NAME = "Props";
const PROPS_NAME_MESSAGE = `A props interface declared in an SFC is named \`${PROPS_NAME}\` — the file path already spells the rest. Rename it, or move the shape to its own \`.ts\` beside the component if another file reads it.`;
// Whether a node sits anywhere under a `defineProps` call. A type reference reaches the macro through any depth
// Of composite — `A & B`, `Pick<A, "x">`, `A | B` — and a local declaration is no less local for being nested in
// One, so the ancestry decides membership rather than the shape of the argument.
const getIsUnderDefineProps = (node: ESTree.Node): boolean => {
  for (let current = node.parent; current; current = current.parent)
    if (current.type === "CallExpression")
      return current.callee.type === "Identifier" && current.callee.name === "defineProps";
  return false;
};

const propsNameRule = defineRule({
  create(context) {
    const declarationMap = new Map<string, ESTree.Node>();
    const propsTypeNames = new Set<string>();
    const recordDeclaration = (node: ESTree.TSInterfaceDeclaration | ESTree.TSTypeAliasDeclaration): void => {
      declarationMap.set(node.id.name, node);
    };
    return {
      CallExpression(node) {
        if (node.callee.type !== "Identifier" || node.callee.name !== "defineProps") return;
        const type = node.typeArguments?.params[0];
        // An inline object literal is the one shape with nowhere to hang a default's comment or a prop's, and
        // It cannot be reused by the slot types beside it — the named declaration costs one line
        if (type?.type === "TSTypeLiteral") context.report({ message: INLINE_TYPE_MESSAGE, node: type });
      },
      "Program:exit"() {
        for (const name of propsTypeNames) {
          if (name === PROPS_NAME) continue;
          const declaration = declarationMap.get(name);
          // A name this file does not declare is an imported module or an external library type, which this rule
          // Has no say over — the component is using an existing shape rather than naming one
          if (declaration) context.report({ message: PROPS_NAME_MESSAGE, node: declaration });
        }
      },
      TSInterfaceDeclaration: recordDeclaration,
      TSTypeAliasDeclaration: recordDeclaration,
      TSTypeReference(node) {
        if (node.typeName.type === "Identifier" && getIsUnderDefineProps(node)) propsTypeNames.add(node.typeName.name);
      },
    };
  },
  meta: { type: "suggestion" },
});

const exportedTypeRule = defineRule({
  create(context) {
    return {
      // `export default interface Foo {}` — unreachable in `<script setup>`, but an SFC may carry a plain
      // `<script>` block beside it, and the rule is about the export rather than about which block it sits in
      ExportDefaultDeclaration(node) {
        if (node.declaration.type === "TSInterfaceDeclaration")
          context.report({ message: EXPORTED_TYPE_MESSAGE, node: node.declaration });
      },
      ExportNamedDeclaration(node) {
        const { declaration } = node;
        if (
          declaration?.type === "TSInterfaceDeclaration" ||
          declaration?.type === "TSTypeAliasDeclaration" ||
          declaration?.type === "TSEnumDeclaration"
        ) {
          context.report({ message: EXPORTED_TYPE_MESSAGE, node: declaration });
          return;
        }
        // `export type { Foo }` marks the statement, `export { type Foo }` marks the specifier — a re-export
        // Hands the type out exactly as a declaration would, so neither spelling is a way around the rule
        for (const specifier of node.specifiers)
          if (node.exportKind === "type" || specifier.exportKind === "type")
            context.report({ message: EXPORTED_TYPE_MESSAGE, node: specifier });
      },
    };
  },
  meta: { type: "suggestion" },
});

const plugin: Plugin = definePlugin({
  meta: { name: "props-interface" },
  rules: { "no-exported-type": exportedTypeRule, "require-props-name": propsNameRule },
});

export default plugin;
