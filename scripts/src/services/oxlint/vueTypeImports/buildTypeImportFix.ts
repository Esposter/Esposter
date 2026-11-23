import type { ESTree, Fix, Fixer, SourceCode } from "@oxlint/plugins";

const IMPORT_KEYWORD_LENGTH = "import".length;

const checkIsNamedSpecifier = (specifier: ESTree.ImportDeclarationSpecifier): specifier is ESTree.ImportSpecifier =>
  specifier.type === "ImportSpecifier";

// The `separate-type-imports` style: each type-only binding moves to an `import type` ahead of the declaration.
// What stays is the value import below them, and a declaration with nothing left takes `type` after `import`.
// The exception is a default beside named or namespace bindings, since `import type A, { B }` is not valid TypeScript.
export const buildTypeImportFix = (
  fixer: Fixer,
  sourceCode: SourceCode,
  node: ESTree.ImportDeclaration,
  typeSpecifiers: ESTree.ImportDeclarationSpecifier[],
): Fix | null => {
  // A comment inside the declaration would be dropped by the rewrite, so the violation is reported with no fix
  if (sourceCode.getCommentsInside(node).length > 0) return null;
  const valueSpecifiers = node.specifiers.filter((specifier) => !typeSpecifiers.includes(specifier));
  const hasDefaultSpecifier = node.specifiers.some((specifier) => specifier.type === "ImportDefaultSpecifier");
  if (valueSpecifiers.length === 0 && !(hasDefaultSpecifier && node.specifiers.length > 1))
    return fixer.insertTextAfterRange([node.range[0], node.range[0] + IMPORT_KEYWORD_LENGTH], " type");
  return fixer.replaceText(node, buildSplitText(sourceCode, node, typeSpecifiers, valueSpecifiers));
};

// Named bindings share one declaration, while a default or namespace binding takes one of its own
const buildSplitText = (
  sourceCode: SourceCode,
  node: ESTree.ImportDeclaration,
  typeSpecifiers: ESTree.ImportDeclarationSpecifier[],
  valueSpecifiers: ESTree.ImportDeclarationSpecifier[],
): string => {
  const sourceText = sourceCode.getText(node.source);
  const getTexts = (specifiers: ESTree.ImportDeclarationSpecifier[]): string[] =>
    specifiers.map((specifier) => sourceCode.getText(specifier));
  const typeNamedTexts = getTexts(typeSpecifiers.filter((specifier) => checkIsNamedSpecifier(specifier)));
  const valueNamedTexts = getTexts(valueSpecifiers.filter((specifier) => checkIsNamedSpecifier(specifier)));
  const typeDeclarations = [
    ...getTexts(typeSpecifiers.filter((specifier) => !checkIsNamedSpecifier(specifier))).map(
      (text) => `import type ${text} from ${sourceText};`,
    ),
    ...(typeNamedTexts.length > 0 ? [`import type { ${typeNamedTexts.join(", ")} } from ${sourceText};`] : []),
  ];
  // The value import keeps the tail after its source, the attributes and the semicolon, since it still loads at runtime
  const valueClause = [
    ...getTexts(valueSpecifiers.filter((specifier) => !checkIsNamedSpecifier(specifier))),
    ...(valueNamedTexts.length > 0 ? [`{ ${valueNamedTexts.join(", ")} }`] : []),
  ];
  const valueTail = sourceCode.text.slice(node.source.range[1], node.range[1]);
  const valueDeclarations =
    valueSpecifiers.length > 0 ? [`import ${valueClause.join(", ")} from ${sourceText}${valueTail}`] : [];
  return [...typeDeclarations, ...valueDeclarations].join("\n");
};
