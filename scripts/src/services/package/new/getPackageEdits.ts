import type { CreatePackageOptions } from "#src/models/package/CreatePackageOptions";

import { PackageKind } from "#src/models/package/PackageKind";
import {
  AGENTS_FILE,
  APP_MODULES_FILE,
  GITHUB_REPOSITORY_URL,
  PACKAGES_DIRECTORY,
  QUALITY_LEDGER_FILE,
  README_FILE,
} from "#src/services/package/new/constants";
import { getPackageName } from "#src/services/package/new/getPackageName";
import { insertAfterLastMatch } from "#src/services/package/new/insertAfterLastMatch";
import { insertBeforeMatch } from "#src/services/package/new/insertBeforeMatch";
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
        /^ {2}trpcNuxtModule,$/u,
        `  ${moduleConstant},`,
      ),
    );
  return edits;
};
