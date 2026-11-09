import type { ESTree, Fix, Fixer, SourceCode } from "@oxlint/plugins";

import { checkIsCallOf } from "#src/services/oxlint/propsInterface/checkIsCallOf";

type PatternProperty = ESTree.BindingProperty | ESTree.BindingRestElement;

// Drops every unread prop of one destructure and keeps the commas valid.
// The separator after a run of unread props goes with it, or the separator before it when the run ends the pattern.
// So the kept props keep their layout, and a run is bounded by a kept prop, so no two removals overlap.
// Each report of the pattern carries the same removals: the first applies them all in one pass, and oxlint drops the
// Identical duplicates.
// Emptying the pattern turns the declaration into the bare call, which keeps the call's runtime arguments.
// A `withDefaults` call is the exception, since its defaults would go with it, and a bare `withDefaults()` statement is
// Not a macro the compiler reads, so that case is reported without a fix.
export const buildUnreadRemovalFix = (
  fixer: Fixer,
  sourceCode: SourceCode,
  declaration: ESTree.VariableDeclaration,
  declarator: ESTree.VariableDeclarator & { id: ESTree.ObjectPattern; init: ESTree.CallExpression },
  unreadProperties: ESTree.BindingProperty[],
): Fix[] | null => {
  const { properties } = declarator.id;
  if (unreadProperties.length === properties.length) {
    if (declaration.declarations.length > 1 || checkIsCallOf(declarator.init, "withDefaults")) return null;
    return [fixer.replaceText(declaration, `${sourceCode.getText(declarator.init)};`)];
  }
  const unreadSet = new Set<PatternProperty>(unreadProperties);
  const fixes: Fix[] = [];
  let keptBefore: PatternProperty | undefined;
  let runFirst: PatternProperty | undefined;
  let runLast: PatternProperty | undefined;
  for (const property of properties) {
    if (unreadSet.has(property)) {
      runFirst ??= property;
      runLast = property;
      continue;
    }
    if (runFirst) fixes.push(fixer.removeRange([runFirst.range[0], property.range[0]]));
    runFirst = undefined;
    keptBefore = property;
  }
  if (runFirst && runLast && keptBefore) fixes.push(fixer.removeRange([keptBefore.range[1], runLast.range[1]]));
  return fixes;
};
