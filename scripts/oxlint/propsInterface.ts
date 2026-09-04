import type { ESTree, Plugin } from "@oxlint/plugins";

import { definePlugin, defineRule } from "@oxlint/plugins";
// Oxlint JS plugin enforcing the SFC props-interface convention (vue/SKILL.md).
//
// A props interface declared inside an SFC is file-scoped, so every word beyond `Props` is a word the file path
// Already spells. Counting those words was previously a judgement call settled per folder, which no linter can
// Check and which therefore drifted; the name is now fixed at `Props` and there is nothing left to decide.
//
// A shape another file reads is a different thing: it moves to `models/` under its own name, the way
// `vue-phaserjs` already keeps `SceneProps`/`TextProps`. So an SFC exports no type at all, and an import site
// Never has to guess whether a name it reads came from a component or a model.
//
// Both rules are purely syntactic and scoped to `**/*.vue` in the root .oxlintrc.json.
const EXPORTED_TYPE_MESSAGE =
  "An SFC exports no type: a shape read outside this file belongs in `models/` under its own name. Move it there and import it here.";
const INLINE_TYPE_MESSAGE =
  "`defineProps` takes a named type, never an inline object literal — declare `interface Props` above it.";
const PROPS_NAME = "Props";
const PROPS_NAME_MESSAGE = `A props interface declared in an SFC is named \`${PROPS_NAME}\` — the file path already spells the rest. Rename it, or move the shape to \`models/\` if another file reads it.`;
// The outermost type reference a `defineProps` argument resolves to, or undefined when the argument is not a
// Reference at all — `Pick<…>` and an external generic both root on a name this file does not declare, and the
// Locally-declared check downstream is what makes that distinction rather than this function.
const getRootTypeName = (type: ESTree.Node | undefined): string | undefined => {
  if (type?.type !== "TSTypeReference") return undefined;
  return type.typeName.type === "Identifier" ? type.typeName.name : undefined;
};

const propsNameRule = defineRule({
  create(context) {
    const declarationMap = new Map<string, ESTree.Node>();
    let propsTypeName: string | undefined;
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
        propsTypeName = getRootTypeName(type);
      },
      "Program:exit"() {
        if (propsTypeName === undefined || propsTypeName === PROPS_NAME) return;
        const declaration = declarationMap.get(propsTypeName);
        // A name this file does not declare is an imported model or an external library type, which this rule
        // Has no say over — the component is using an existing shape rather than naming one
        if (declaration) context.report({ message: PROPS_NAME_MESSAGE, node: declaration });
      },
      TSInterfaceDeclaration: recordDeclaration,
      TSTypeAliasDeclaration: recordDeclaration,
    };
  },
  meta: { type: "suggestion" },
});

const exportedTypeRule = defineRule({
  create(context) {
    return {
      ExportNamedDeclaration(node) {
        const { declaration } = node;
        if (
          declaration?.type === "TSInterfaceDeclaration" ||
          declaration?.type === "TSTypeAliasDeclaration" ||
          declaration?.type === "TSEnumDeclaration"
        )
          context.report({ message: EXPORTED_TYPE_MESSAGE, node: declaration });
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
