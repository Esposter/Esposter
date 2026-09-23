import type { FileOrganizationFinding } from "#src/models/sweeps/fileOrganization/FileOrganizationFinding";

import { FileOrganizationFindingType } from "#src/models/sweeps/fileOrganization/FileOrganizationFindingType";
import { checkIsCompanion } from "#src/services/sweeps/fileOrganization/checkIsCompanion";
import {
  COLOCATED_MAP_SUFFIXES,
  COMPONENTS_DIRECTORY,
  COMPOSABLES_DIRECTORY,
  CONSTANTS_FILE_REGEX,
  ENUM_SUFFIX,
  EXPORT_REGEX,
  LOCAL_TYPE_REGEX,
  MODEL_DIRECTORIES,
  MODULE_CONSTANT_REGEX,
  SCHEMA_DIRECTORY,
  SCHEMA_SUFFIX,
  TYPE_KINDS,
} from "#src/services/sweeps/fileOrganization/constants";
import { basename, extname } from "node:path";

const getNames = (text: string, regex: RegExp): string[] => [
  ...new Set(Array.from(text.matchAll(regex), (match) => String(match.groups?.name))),
];
// The four shapes the file-organization skill states that a read of one file can decide, as candidates for the
// Pass rather than findings in themselves — the skill's exceptions are a roster no scan can hold, so what is
// Reported is what the pass then reads. A second export is a second concern only when it is not a companion of
// The file's shortest one; a drizzle table file's `pgEnum` wrappers sit beside the table that reads them. An
// Exported type outside a models layer is reported when no value export in the file is its companion — the
// Twin, schema and composable-options shapes the skill allows. A local type is reported unless it is the event
// Or hook map the skill colocates, in a composable, or in an SFC, whose `Props` is the vue skill's; a suite's
// Fixture shapes are the testing ledger's, and no suite reaches here — and a shape another file reads sits beside
// The component that owns it, named after its one export. A screaming constant at module scope in an SFC or
// Composable belongs in a `constants.ts`.
export const getFileOrganizationFindings = (path: string, text: string): FileOrganizationFinding[] => {
  const isVue = path.endsWith(".vue");
  const isComposable = path.includes(COMPOSABLES_DIRECTORY);
  const isConstantsFile = CONSTANTS_FILE_REGEX.test(path);
  // An enum's type and value twin, or a function's overloads, are one export declared twice
  const exports = Array.from(text.matchAll(EXPORT_REGEX), (match) => ({
    isType: TYPE_KINDS.includes(String(match.groups?.kind)),
    name: String(match.groups?.name),
  }));
  const exportNames = [...new Set(exports.map(({ name }) => name))];
  const findings: FileOrganizationFinding[] = [];

  if (!isVue && !isConstantsFile && exportNames.length > 1) {
    const isSanctionedBeside = (name: string) =>
      (path.includes(SCHEMA_DIRECTORY) && name.endsWith(ENUM_SUFFIX)) ||
      (MODEL_DIRECTORIES.some((directory) => path.includes(directory)) && name.endsWith(SCHEMA_SUFFIX));
    const base =
      exportNames.filter((name) => !isSanctionedBeside(name)).toSorted((a, b) => a.length - b.length)[0] ?? "";
    const strangers = exportNames.filter((name) => !checkIsCompanion(name, base) && !isSanctionedBeside(name));
    if (strangers.length > 0)
      findings.push({ names: exportNames, path, type: FileOrganizationFindingType.ExportsPerFile });
  }

  if (!isVue && !MODEL_DIRECTORIES.some((directory) => path.includes(directory))) {
    const typeNames = [...new Set(exports.filter(({ isType }) => isType).map(({ name }) => name))];
    const valueNames = [...new Set(exports.filter(({ isType }) => !isType).map(({ name }) => name))];
    const fileName = basename(path, extname(path));
    const orphans = typeNames.filter(
      (typeName) =>
        !(path.includes(COMPONENTS_DIRECTORY) && typeName === fileName) &&
        !valueNames.some((valueName) => checkIsCompanion(valueName, typeName) || checkIsCompanion(typeName, valueName)),
    );
    if (orphans.length > 0)
      findings.push({ names: orphans, path, type: FileOrganizationFindingType.TypeOutsideModels });

    const localTypeNames = getNames(text, LOCAL_TYPE_REGEX).filter(
      (name) => !COLOCATED_MAP_SUFFIXES.some((suffix) => name.endsWith(suffix)),
    );
    if (localTypeNames.length > 0 && !isComposable)
      findings.push({ names: localTypeNames, path, type: FileOrganizationFindingType.LocalType });
  }

  if ((isVue || isComposable) && !isConstantsFile) {
    const constantNames = getNames(text, MODULE_CONSTANT_REGEX);
    if (constantNames.length > 0)
      findings.push({ names: constantNames, path, type: FileOrganizationFindingType.ModuleConstant });
  }

  return findings;
};
