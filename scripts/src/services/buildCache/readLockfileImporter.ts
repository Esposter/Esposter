import { LOCKFILE } from "#src/services/shared/constants";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface LockfileImporter {
  // The importer's own block as the lockfile writes it, so a changed specifier or resolution changes its text
  lines: string[];
  // The workspace packages it links, by the directory the lockfile names them with
  linkDependencies: { name: string; path: string }[];
  // Every registry dependency's `name@version`, the key the lockfile's `snapshots` section names it by
  snapshotKeys: string[];
}

const IMPORTER_DEPENDENCY_REGEX = /^ {6}(?! )'?(?<name>[^':]+)'?:$/u;
const IMPORTER_VERSION_REGEX = /^ {8}version: '?(?<version>[^']+?)'?$/u;
const TOP_LEVEL_LINE_REGEX = /^ {0,2}\S/u;
// A key the lockfile writes at column zero, such as `snapshots:`, which closes the section before it
const TOP_LEVEL_KEY_REGEX = /^\S/u;

export const readLockfileLines = (repositoryRoot: string): string[] =>
  readFileSync(join(repositoryRoot, LOCKFILE), "utf8").split(/\r?\n/u);

// The block the lockfile's `importers` section holds for one package directory, relative to the repository root
export const readLockfileImporter = (lockfileLines: string[], importerPath: string): LockfileImporter => {
  const headerIndex = lockfileLines.indexOf(`  ${importerPath}:`);
  const lines: string[] = [];
  if (headerIndex !== -1)
    for (const line of lockfileLines.slice(headerIndex + 1)) {
      if (TOP_LEVEL_LINE_REGEX.test(line)) break;
      lines.push(line);
    }

  const linkDependencies: LockfileImporter["linkDependencies"] = [];
  const snapshotKeys: string[] = [];
  let dependencyName = "";
  for (const line of lines) {
    const dependencyGroups = IMPORTER_DEPENDENCY_REGEX.exec(line)?.groups?.name;
    if (dependencyGroups !== undefined) dependencyName = dependencyGroups;

    const version = IMPORTER_VERSION_REGEX.exec(line)?.groups?.version;
    if (version === undefined || dependencyName === "") continue;
    if (version.startsWith("link:"))
      linkDependencies.push({ name: dependencyName, path: version.slice("link:".length) });
    else snapshotKeys.push(`${dependencyName}@${version}`);
  }

  return { lines, linkDependencies, snapshotKeys };
};

const SNAPSHOT_ENTRY_REGEX = /^ {2}(?! )'?(?<key>.+?)'?:(?: \{\})?$/u;
const SNAPSHOT_DEPENDENCY_REGEX = /^ {6}(?! )'?(?<name>[^':]+)'?: '?(?<version>[^']+?)'?$/u;
const SNAPSHOT_SUBSECTION_REGEX = /^ {4}(?:optionalDependencies|dependencies):$/u;

// The lockfile's `snapshots` blocks reachable from the given keys, sorted and joined as text. A transitive version moves
// Only its own snapshot block, never the importer's, so a key built from the importer alone would miss it.
export const readLockfileSnapshotClosure = (lockfileLines: string[], rootKeys: string[]): string => {
  const snapshotsStart = lockfileLines.indexOf("snapshots:");
  if (snapshotsStart === -1) return "";

  const blocks = new Map<string, { dependencyKeys: string[]; lines: string[] }>();
  let currentKey = "";
  for (const line of lockfileLines.slice(snapshotsStart + 1)) {
    if (TOP_LEVEL_KEY_REGEX.test(line)) break;
    const entryKey = SNAPSHOT_ENTRY_REGEX.exec(line)?.groups?.key;
    if (entryKey !== undefined) {
      currentKey = entryKey;
      blocks.set(currentKey, { dependencyKeys: [], lines: [] });
    }
    const block = blocks.get(currentKey);
    if (block === undefined) continue;
    block.lines.push(line);
    if (SNAPSHOT_SUBSECTION_REGEX.test(line)) continue;
    const dependency = SNAPSHOT_DEPENDENCY_REGEX.exec(line)?.groups;
    if (dependency?.name !== undefined && dependency.version !== undefined)
      block.dependencyKeys.push(`${dependency.name}@${dependency.version}`);
  }

  const visited = new Set<string>();
  const pending = [...rootKeys];
  while (pending.length > 0) {
    const key = pending.pop();
    if (key === undefined || visited.has(key)) continue;
    visited.add(key);
    pending.push(...(blocks.get(key)?.dependencyKeys ?? []));
  }

  return [...visited]
    .filter((key) => blocks.has(key))
    .toSorted()
    .map((key) => `${key}\n${blocks.get(key)?.lines.join("\n")}`)
    .join("\n");
};
