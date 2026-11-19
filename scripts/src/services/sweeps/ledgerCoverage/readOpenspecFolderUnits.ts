import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readdirSync } from "node:fs";
import { join, relative } from "node:path";

const OPENSPEC_DIRECTORY = "openspec";
const OPENSPEC_ROOTS = ["specs", "changes", "deferred", "rejected"];
// The documents a folder holds when it is a spec, a change, a deferred idea or a rejected one
const OPENSPEC_DOCUMENTS = new Set(["design.md", "proposal.md", "spec.md", "tasks.md"]);

// Every folder under the openspec tree that holds one of its documents, as a backticked repository-relative path. A
// Folder with only subfolders or a README is no unit, so the tree's own folders decide what a tooling row covers.
export const readOpenspecFolderUnits = (): string[] => [
  ...new Set(
    OPENSPEC_ROOTS.flatMap((root) =>
      readdirSync(join(REPOSITORY_ROOT, OPENSPEC_DIRECTORY, root), { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile() && OPENSPEC_DOCUMENTS.has(entry.name))
        .map(({ parentPath }) => toOpenspecFolderUnit(relative(REPOSITORY_ROOT, parentPath))),
    ),
  ),
];

// Windows' separator is read as the repository's, which every ledger row and pathspec is written in. A row spelled with
// Backslashes matches no trailer, so it loses its dates, and every other checkout then rewrites the whole table back
export const toOpenspecFolderUnit = (repositoryPath: string): string => `\`${repositoryPath.replaceAll("\\", "/")}\``;
