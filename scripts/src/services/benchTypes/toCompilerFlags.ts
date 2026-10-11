import type { TypeBenchCompilerOptions } from "#src/models/benchTypes/TypeBenchCompilerOptions";

import { EMPTY_TYPE_ROOTS_DIRECTORY } from "#src/services/benchTypes/constants";

// Options that name an output the check never writes, or that a file-mode run cannot take: `composite` and
// `isolatedDeclarations` demand every imported file be listed, and `incremental` writes a build-info file
const NON_CHECKING_OPTIONS = new Set(["composite", "declaration", "incremental", "isolatedDeclarations", "types"]);

// The package's options as command-line flags. A counting run has to be a file-mode run: `tsc -p` prints zero Types and
// Instantiations, whatever the program. A package that names no types gets no ambient `@types`, which an empty
// `typeRoots` gives where an empty `--types` is refused.
export const toCompilerFlags = (compilerOptions: TypeBenchCompilerOptions): string[] => {
  const typeFlags =
    Array.isArray(compilerOptions.types) && compilerOptions.types.length > 0
      ? ["--types", compilerOptions.types.join(",")]
      : ["--typeRoots", EMPTY_TYPE_ROOTS_DIRECTORY];
  const optionFlags = Object.entries(compilerOptions).flatMap(([name, value]) => {
    if (NON_CHECKING_OPTIONS.has(name) || value === false) return [];
    if (value === true) return [`--${name}`];
    if (Array.isArray(value)) return value.length > 0 ? [`--${name}`, value.join(",")] : [];

    return [`--${name}`, String(value)];
  });

  return [...optionFlags, ...typeFlags];
};
