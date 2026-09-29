import type { RenameMap } from "#src/models/identifiers/rename/RenameMap";

import { getBoundNames } from "#src/services/identifiers/rename/getBoundNames";
import { getCodeSpans } from "#src/services/identifiers/rename/getCodeSpans";

const getAlternation = (names: Iterable<string>) =>
  Array.from(names, (name) => RegExp.escape(name))
    .toSorted((firstName, secondName) => secondName.length - firstName.length)
    .join("|");

// Renames every name the map holds in one TypeScript source, where the source binds it and only in code. A key that
// Merely shares the spelling (`{ users: … }`) and a property read (`a.users`) are left alone, except a read through
// One of the map's accessors (`db.query.users`), which names the export; a spread (`...users`) reads the binding and
// Is renamed. What this cannot see bound is left for the typecheck to find
export const renameIdentifiers = (text: string, renameMap: RenameMap, isSource: boolean): string => {
  const { accessors, renames, specifiers } = renameMap;
  const { aliasedNames, boundNames, importRegex } = getBoundNames(renameMap, text, isSource);
  const getRename = (name: string) => renames[name] ?? name;
  const boundRegex =
    boundNames.size > 0
      ? new RegExp(
          `(?<![\\w$])(?:(?<=\\.\\.\\.)|(?<!\\.))(${getAlternation(boundNames)})(?![\\w$])(?!\\s*\\??\\s*:(?!:))`,
          "gu",
        )
      : undefined;
  const accessorRegex =
    accessors.length > 0
      ? new RegExp(
          `(?<![\\w$])((?:${getAlternation(accessors)})\\.)(${getAlternation(Object.keys(renames))})(?![\\w$])`,
          "gu",
        )
      : undefined;
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
  let renamedText = "";
  let last = 0;
  for (const [start, end] of getCodeSpans(aliasedText)) {
    let code = aliasedText.slice(start, end);
    if (boundRegex) code = code.replaceAll(boundRegex, (name) => getRename(name));
    if (accessorRegex)
      code = code.replaceAll(accessorRegex, (_, accessor: string, name: string) => `${accessor}${getRename(name)}`);
    renamedText += `${aliasedText.slice(last, start)}${code}`;
    last = end;
  }
  renamedText += aliasedText.slice(last);
  // A moved file's specifier is a string, so it is rewritten whole and never as a fragment of another specifier
  for (const [from, to] of Object.entries(specifiers))
    renamedText = renamedText.replaceAll(new RegExp(`(["'])${RegExp.escape(from)}\\1`, "gu"), `$1${to}$1`);
  return renamedText;
};
