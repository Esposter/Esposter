import type { TypeBenchCompilerOptions } from "#src/models/benchTypes/TypeBenchCompilerOptions";

// What `tsc --showConfig` prints: the package's tsconfig with every extends resolved
export interface TypeBenchShowConfig {
  compilerOptions: TypeBenchCompilerOptions;
}
