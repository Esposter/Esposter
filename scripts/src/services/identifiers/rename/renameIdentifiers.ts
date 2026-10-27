import type { RenameMap } from "#src/models/identifiers/rename/RenameMap";
import type { SyntaxNode } from "#src/models/syntax/SyntaxNode";

import { checkIsName } from "#src/services/identifiers/rename/checkIsName";
import { getAlternation } from "#src/services/identifiers/rename/getAlternation";
import { getBoundNames } from "#src/services/identifiers/rename/getBoundNames";
import { getChildren } from "#src/services/shared/getChildren";
import { parents } from "#src/services/shared/getParent";
import { parseSource } from "#src/services/shared/parseSource";

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
    const program = parseSource(aliasedText);
    const getReplacement = (identifier: Extract<SyntaxNode, { type: "Identifier" }>): string | undefined => {
      const { name } = identifier;
      const parent = parents.get(identifier);
      if (parent?.type === "MemberExpression" && !parent.computed && parent.property === identifier) {
        const { object } = parent;
        const accessor = object.type === "MemberExpression" && !object.computed ? object.property : object;
        return Object.hasOwn(renames, name) && accessor.type === "Identifier" && accessors.includes(accessor.name)
          ? getRename(name)
          : undefined;
      }
      if (!boundNames.has(name)) return undefined;
      // A shorthand property, in an object literal or a destructuring, and a default in one: both keep their key
      const grandparent = parent?.type === "AssignmentPattern" ? parents.get(parent) : undefined;
      if (
        (parent?.type === "Property" && parent.shorthand) ||
        (grandparent?.type === "Property" &&
          grandparent.shorthand &&
          parent?.type === "AssignmentPattern" &&
          parent.left === identifier)
      )
        return `${name}: ${getRename(name)}`;
      return checkIsName(parent, identifier) ? undefined : getRename(name);
    };
    let last = 0;
    renamedText = "";
    // A comment is trivia the tree never visits, and a string or a template literal's text is never an identifier. A
    // Shorthand property lists its key and its value at one position, so a position already rewritten is skipped
    const visit = (node: SyntaxNode): void => {
      if (node.type === "Identifier" && node.start >= last) {
        const replacement = getReplacement(node);
        if (replacement !== undefined) {
          renamedText += `${aliasedText.slice(last, node.start)}${replacement}`;
          // An identifier's span takes in its type annotation, which must survive the rename, so only its name is replaced
          last = node.start + node.name.length;
        }
      }
      for (const child of getChildren(node)) visit(child);
    };
    visit(program);
    renamedText += aliasedText.slice(last);
  }
  // A moved file's specifier is a string, so it is rewritten whole and never as a fragment of another specifier
  for (const [from, to] of Object.entries(specifiers))
    renamedText = renamedText.replaceAll(new RegExp(`(["'])${RegExp.escape(from)}\\1`, "gu"), `$1${to}$1`);
  return renamedText;
};
