// The code trees the scan reads, relative to the repository root: every tree of code the repository owns. The
// Tooling is in because it repeats the app's shapes, and a copy there is still a copy.
export const DUPLICATE_CODE_SCOPES: string[] = [
  "apps/web/app",
  "apps/web/server",
  "apps/web/shared",
  "apps/functions/src",
  "apps/infra/src",
  "packages",
  "scripts/src",
];
// Typescript and Vue are the two formats the repository writes code in, so the scan reads a Vue file's script the
// Way it reads a `.ts` file rather than as an opaque block.
export const DUPLICATE_CODE_FORMATS: string[] = ["typescript", "vue"];
// Fifty tokens is the least run that carries a decision rather than a call and its arguments, which a copy of is
// Almost always the shape of the call rather than the duplicated work.
export const MIN_DUPLICATE_TOKENS = 50;
// Five lines is the least run a reader can see as one block, below which a shared pair of lines is a coincidence of
// Syntax.
export const MIN_DUPLICATE_LINES = 5;
// Tests repeat literals on purpose (the `test-values` skill), and a generated file or a declaration is the output of
// Another tool, so no copy in any of them is one a reader could fix. An asset is drawn content, an SVG's paths rather
// Than logic, and each Azure resource declaration is Azure's own exported shape, which the `pulumi-infra` skill's
// Settled list keeps one per file rather than behind a factory that would copy the SDK's argument type
export const DUPLICATE_CODE_IGNORED_GLOBS: string[] = [
  "**/*.test.ts",
  "**/*.test-d.ts",
  "**/*.bench.ts",
  "**/generated/**",
  "**/node_modules/**",
  "**/dist/**",
  "**/*.d.ts",
  "**/migrations/**",
  "**/apps/web/app/assets/**",
  "**/apps/infra/src/azure/resources/**",
];
