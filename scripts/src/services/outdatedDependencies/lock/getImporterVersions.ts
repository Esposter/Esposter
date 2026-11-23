import { parseLockTree } from "#src/services/outdatedDependencies/lock/parseLockTree";

// The tree is the lockfile's last document, the one with the importers and the snapshots
const TREE_DOCUMENT_MARKER = "\n---\n";
const IMPORTER_DEPENDENCY_FIELDS = ["dependencies", "devDependencies", "optionalDependencies"];
const LINK_PREFIX = "link:";

// The version each direct dependency of an importer resolves to, without the peer suffix in parentheses. A link runs to
// A workspace package, and a version there is no registry version to hold anything to
export const getImporterVersions = (lockYaml: string, importerPath: string): Map<string, string> => {
  const tree = parseLockTree(lockYaml.slice(lockYaml.lastIndexOf(TREE_DOCUMENT_MARKER)));
  const importer = tree.children.get("importers")?.children.get(importerPath);
  return new Map(
    IMPORTER_DEPENDENCY_FIELDS.flatMap((field) =>
      [...(importer?.children.get(field)?.children ?? [])].flatMap(([name, edge]) => {
        const version = edge.children.get("version")?.value;
        return version === undefined || version.startsWith(LINK_PREFIX)
          ? []
          : [[name, version.split("(", 1)[0] ?? version] as const];
      }),
    ),
  );
};
