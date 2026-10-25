import type { WiringBlock } from "#src/models/sweeps/duplicateCode/WiringBlock";

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
// The manifest a Claude plugin's directory holds, the one a plugin's root is read by
export const CLAUDE_PLUGIN_MANIFEST_PATH = ".claude-plugin/plugin.json";
// A composable's destructured call, or a props destructure of defineProps, opens on `const {` and closes on the
// `} = useName(...);` or `} = defineProps<...>();` that binds it, and its return opens on `return {`. A block is a
// Declaration only while every line in it is an entry: a bare name or `name: alias,` in a call, and a bare name in a
// Return. A block with a computed value stays code.
export const WIRING_BLOCKS: WiringBlock[] = [
  {
    end: /^\s*\} = (?:use\w+|defineProps<.*>)\(.*\);\s*$/u,
    entry: /^\s*\w+(?:: \w+)?,\s*$/u,
    start: /^\s*const \{\s*$/u,
  },
  { end: /^\s*\};?\s*$/u, entry: /^\s*\w+,\s*$/u, start: /^\s*return \{\s*$/u },
];
// A fragment's name is its path, behind Windows' verbatim `\\?\` prefix, and a Vue file's name ends in `:` and the
// Format its script was read as. A drive's `:` is never followed by letters, so the suffix matches only the format.
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const WINDOWS_VERBATIM_PREFIX_REGEX: RegExp = /^\\\\\?\\/u;
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const FORMAT_SUFFIX_REGEX: RegExp = /:[a-z]+$/u;
