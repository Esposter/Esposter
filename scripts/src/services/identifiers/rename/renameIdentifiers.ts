import type { RenameMap } from "#src/models/identifiers/rename/RenameMap";

import { getBoundNames } from "#src/services/identifiers/rename/getBoundNames";
import ts from "typescript";

const getAlternation = (names: Iterable<string>) =>
  Array.from(names, (name) => RegExp.escape(name))
    .toSorted((firstName, secondName) => secondName.length - firstName.length)
    .join("|");

// Renames every name the map holds in one TypeScript source, where the source binds it and only in code, read from
// The syntax tree rather than the text. A key that merely shares the spelling (`{ users: … }`) and a property read
// (`a.users`) are left alone, except a read through one of the map's accessors (`db.query.users`), which names the
// Export; a shorthand key keeps its key (`{ users }` becomes `{ users: … }`). A binding that shadows a bound name is
// Renamed with every read of it, which keeps the code meaning what it did. What this cannot see bound is left for
// The typecheck to find
export const renameIdentifiers = (text: string, renameMap: RenameMap, isSource: boolean): string => {
  const { accessors, renames, specifiers } = renameMap;
  const { aliasedNames, boundNames, importRegex } = getBoundNames(renameMap, text, isSource);
  const getRename = (name: string) => renames[name] ?? name;
  const aliasedRegex =
    aliasedNames.size > 0 ? new RegExp(`(?<![\\w$])(${getAlternation(aliasedNames)})(?=\\s+as\\s)`, "gu") : undefined;

  const aliasedText = aliasedRegex
    ? text.replaceAll(importRegex, (statement, specifierList: string) =>
        statement.replace(
          specifierList,
          specifierList.replaceAll(aliasedRegex, (name) => getRename(name)),
        ),
      )
    : text;
  let renamedText = aliasedText;
  if (boundNames.size > 0 || accessors.some((accessor) => aliasedText.includes(`${accessor}.`))) {
    const sourceFile = ts.createSourceFile("", aliasedText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const getReplacement = (identifier: ts.Identifier): string | undefined => {
      const { parent, text: name } = identifier;
      if (ts.isPropertyAccessExpression(parent) && parent.name === identifier) {
        const { expression } = parent;
        const accessor = ts.isPropertyAccessExpression(expression) ? expression.name : expression;
        return Object.hasOwn(renames, name) && ts.isIdentifier(accessor) && accessors.includes(accessor.text)
          ? getRename(name)
          : undefined;
      } else if (!boundNames.has(name)) return undefined;
      else if (
        (ts.isShorthandPropertyAssignment(parent) && parent.name === identifier) ||
        (ts.isBindingElement(parent) &&
          parent.name === identifier &&
          ts.isObjectBindingPattern(parent.parent) &&
          !parent.propertyName &&
          !parent.dotDotDotToken)
      )
        return `${name}: ${getRename(name)}`;
      else if (
        ((ts.isPropertyAssignment(parent) ||
          ts.isPropertySignature(parent) ||
          ts.isPropertyDeclaration(parent) ||
          ts.isMethodDeclaration(parent) ||
          ts.isMethodSignature(parent) ||
          ts.isAccessor(parent) ||
          ts.isEnumMember(parent)) &&
          parent.name === identifier) ||
        (ts.isBindingElement(parent) && parent.propertyName === identifier) ||
        (ts.isQualifiedName(parent) && parent.right === identifier)
      )
        return undefined;
      return getRename(name);
    };
    let last = 0;
    renamedText = "";
    // A comment is trivia the tree never visits, and a string or a template literal's text is never an identifier
    const visit = (node: ts.Node) => {
      const replacement = ts.isIdentifier(node) ? getReplacement(node) : undefined;
      if (replacement !== undefined) {
        const start = node.getStart(sourceFile);
        renamedText += `${aliasedText.slice(last, start)}${replacement}`;
        last = node.end;
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
    renamedText += aliasedText.slice(last);
  }
  // A moved file's specifier is a string, so it is rewritten whole and never as a fragment of another specifier
  for (const [from, to] of Object.entries(specifiers))
    renamedText = renamedText.replaceAll(new RegExp(`(["'])${RegExp.escape(from)}\\1`, "gu"), `$1${to}$1`);
  return renamedText;
};
