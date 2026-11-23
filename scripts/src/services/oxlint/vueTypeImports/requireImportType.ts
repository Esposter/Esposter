// Oxlint's typescript/consistent-type-imports skips .vue script blocks by scope, since it reads no template.
// This rule reads the template's words in its place.
import type { ESTree, Rule } from "@oxlint/plugins";

import { buildTypeImportFix } from "#src/services/oxlint/vueTypeImports/buildTypeImportFix";
import { checkIsNamedInTemplate } from "#src/services/oxlint/vueTypeImports/checkIsNamedInTemplate";
import { checkIsTypeOnlyReference } from "#src/services/oxlint/vueTypeImports/checkIsTypeOnlyReference";
import {
  buildSomeImportsAreOnlyTypesMessage,
  TYPE_OVER_VALUE_MESSAGE,
} from "#src/services/oxlint/vueTypeImports/constants";
import { readTemplateWords } from "#src/services/oxlint/vueTypeImports/readTemplateWords";
import { defineRule } from "@oxlint/plugins";

// The consistent-type-imports classification and fix, for a .vue file whose script block oxlint's own rule never reads.
// A binding the template names is a value there, so a component or an enum read by the template is never typed away.
export const requireImportType: Rule = defineRule({
  create(context) {
    if (!context.filename.endsWith(".vue")) return {};
    const { sourceCode } = context;
    // Read at the first candidate, so a file with no type-only import never opens its template
    let templateWords: Set<string> | undefined;
    const getTemplateWords = (): Set<string> => {
      templateWords ??= readTemplateWords(context.filename);
      return templateWords;
    };
    // A binding nothing in the script reads is left as a value: it is either unused or a component the template uses
    const checkIsTypeOnlySpecifier = (specifier: ESTree.ImportDeclarationSpecifier): boolean => {
      if (specifier.type === "ImportSpecifier" && specifier.importKind === "type") return false;
      const [variable] = sourceCode.getDeclaredVariables(specifier);
      if (
        !variable ||
        variable.references.length === 0 ||
        !variable.references.every((reference) => checkIsTypeOnlyReference(reference))
      )
        return false;
      return !checkIsNamedInTemplate(specifier.local.name, getTemplateWords());
    };
    return {
      ImportDeclaration(node) {
        if (node.importKind === "type") return;
        const typeSpecifiers = node.specifiers.filter((specifier) => checkIsTypeOnlySpecifier(specifier));
        if (typeSpecifiers.length === 0) return;
        context.report({
          fix: (fixer) => buildTypeImportFix(fixer, sourceCode, node, typeSpecifiers),
          message:
            typeSpecifiers.length === node.specifiers.length
              ? TYPE_OVER_VALUE_MESSAGE
              : buildSomeImportsAreOnlyTypesMessage(typeSpecifiers.map((specifier) => specifier.local.name)),
          node,
        });
      },
    };
  },
  meta: { fixable: "code", type: "suggestion" },
});
