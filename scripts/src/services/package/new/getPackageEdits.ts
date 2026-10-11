import type { CreatePackageOptions } from "#src/models/package/CreatePackageOptions";

import { PackageKind } from "#src/models/package/PackageKind";
import {
  AGENTS_FILE,
  APP_MODULES_FILE,
  DEFAULT_DOCS_ICON,
  DOCS_CATEGORY_SECTIONS_FILE,
  DOCS_SECTION_ICON_FILE,
  GITHUB_REPOSITORY_URL,
  PACKAGES_DIRECTORY,
  QUALITY_LEDGER_FILE,
  README_FILE,
  ROOT_DOCS_INDEX_FILE,
} from "#src/services/package/new/constants";
import { getEntryKey } from "#src/services/package/new/getEntryKey";
import { getPackageName } from "#src/services/package/new/getPackageName";
import { insertAfterLastMatch } from "#src/services/package/new/insertAfterLastMatch";
import { insertBeforeMatch } from "#src/services/package/new/insertBeforeMatch";
import { insertBlockEntry } from "#src/services/package/new/insertBlockEntry";
import { insertSortedRow } from "#src/services/package/new/insertSortedRow";

// The one key every inventory row sorts on: the package's directory, which is the same in every table that names it
const getPathKey = (line: string): string => /`(?<path>packages\/[^`]+)`/u.exec(line)?.groups?.path || "";

// The edits a new package makes to the files that already list the workspace's members. Each one edits a file's text to write the row a test reads.
// The test is named beside the edit that writes the row
export const getPackageEdits = (options: CreatePackageOptions): Map<string, (text: string) => string> => {
  const { description, kind, name, register } = options;
  const packageName = getPackageName(options);
  const packagePath = `${PACKAGES_DIRECTORY}/${name}`;
  const moduleConstant = `${name.replaceAll("-", "_").toUpperCase()}_MODULE_PATH`;
  const edits = new Map<string, (text: string) => string>([
    // `packageInventories` holds the agent guide to every member, paired with its npm name
    [
      AGENTS_FILE,
      (text) =>
        insertSortedRow(
          text,
          /^\| `packages\//u,
          `| \`${packagePath}\` | \`${packageName}\` | ${description} |`,
          getPathKey,
        ),
    ],
    // `docsCategorySectionsMap` and `docsSectionIconMap` name every section once, and the root index links every section
    [
      DOCS_CATEGORY_SECTIONS_FILE,
      (text) => insertBlockEntry(text, "  [DocsCategory.Packages]: [", /^ {2}\],$/u, `    "${name}",`, getEntryKey),
    ],
    [
      DOCS_SECTION_ICON_FILE,
      (text) =>
        insertBlockEntry(
          text,
          "export const DocsSectionIconMap: Readonly<Record<string, string>> = {",
          /^\};$/u,
          `  "${name}": "${DEFAULT_DOCS_ICON}",`,
          getEntryKey,
        ),
    ],
    // `ledgerMembers` holds the quality ledger to every member: a new unit is unswept until a sitting reads it
    [QUALITY_LEDGER_FILE, (text) => insertAfterLastMatch(text, /^\| `packages\//u, `| \`${packagePath}\` | — | |`)],
    // `packageInventories` holds the root README to every member, paired with its repository link
    [
      README_FILE,
      (text) =>
        insertSortedRow(
          text,
          /^\| \[`packages\//u,
          `| [\`${packagePath}\`](${GITHUB_REPOSITORY_URL}/tree/main/${packagePath}) | ${description} |`,
          getPathKey,
        ),
    ],
    [
      ROOT_DOCS_INDEX_FILE,
      (text) => insertBeforeMatch(text, /^- \*\*\[Proposals\]/u, `- **[${name}](/docs/${name})** — ${description}`),
    ],
  ]);
  if (kind === PackageKind.NuxtModule && register)
    edits.set(APP_MODULES_FILE, (text) =>
      // The app loads a nuxt-module by its source path, as it loads the others: a constant, then the list
      // `nonVitestModules` holds it in, which `modules` reads outside the Vitest run
      insertBeforeMatch(
        insertAfterLastMatch(
          text,
          /^const [A-Z_]+_MODULE_PATH = /u,
          `const ${moduleConstant} = "../../${packagePath}/src/module.ts";`,
        ),
        /^ {2}trpcModule,$/u,
        `  ${moduleConstant},`,
      ),
    );
  return edits;
};
