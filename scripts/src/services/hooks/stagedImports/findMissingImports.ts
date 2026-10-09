import type { MissingImport } from "#src/models/hooks/MissingImport";
import type { StagedImporter } from "#src/models/hooks/StagedImporter";

import { resolveImportTarget } from "#src/services/hooks/stagedImports/resolveImportTarget";

// The imports whose target none of the probed files is in the commit's tree, where `committedPaths` is HEAD with the
// Commit's staged changes applied, so a target counts when it is tracked or staged and not when only the disk has it
export const findMissingImports = (
  importers: readonly StagedImporter[],
  committedPaths: ReadonlySet<string>,
): MissingImport[] =>
  importers.flatMap(({ aliases, packageDirectory, path, specifiers }) =>
    specifiers.flatMap((specifier) => {
      const target = resolveImportTarget(specifier, path, packageDirectory, aliases);
      if (target === undefined || target.candidates.some((candidate) => committedPaths.has(candidate))) return [];
      return [{ importingPath: path, missingPath: target.path, specifier }];
    }),
  );
