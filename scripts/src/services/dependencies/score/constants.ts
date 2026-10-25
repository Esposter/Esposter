import type { ScoreBand } from "#src/models/dependencies/score/ScoreBand";

import { PackageFormat } from "#src/models/dependencies/score/PackageFormat";

// The ledger the verdict column is read from, at the repository root
export const LEDGER_PATH = ".agents/ledgers/dependencies.md";
// The verdict a catalog entry the ledger has not judged yet carries
export const UNJUDGED_VERDICT = "—";
// A verdict's kind and its reason are split on this, as the ledger writes them
export const VERDICT_SEPARATOR = " — ";
// The reasons a Keep verdict is right to keep a package for whatever its type workarounds, which the shim check does not second-guess
const CORE_EXEMPT_REASONS: string[] = ["engine", "SDK", "framework", "tooling"];
// The reasons a Keep verdict is right to keep a package for, which the absorb check does not second-guess
export const KEEP_EXEMPT_REASONS: string[] = [...CORE_EXEMPT_REASONS, "types", "hold", "free"];

// The score's weights: four dimensions out of 100, each band's points under its exclusive upper bound
export const SIZE_BANDS: ScoreBand[] = [
  { below: 500, points: 35 },
  { below: 2000, points: 26 },
  { below: 5000, points: 15 },
  { below: 20000, points: 6 },
  { below: Number.POSITIVE_INFINITY, points: 0 },
];
export const STABILITY_BANDS: ScoreBand[] = [
  { below: 3, points: 25 },
  { below: 7, points: 15 },
  { below: 16, points: 7 },
  { below: Number.POSITIVE_INFINITY, points: 0 },
];
export const SELF_CONTAINMENT_BANDS: ScoreBand[] = [
  { below: 1, points: 20 },
  { below: 3, points: 12 },
  { below: 6, points: 5 },
  { below: Number.POSITIVE_INFINITY, points: 0 },
];
export const FORMAT_POINTS: Readonly<Record<PackageFormat, number>> = {
  [PackageFormat.Commonjs]: 20,
  [PackageFormat.Dual]: 10,
  [PackageFormat.Esm]: 0,
  [PackageFormat.Types]: 0,
};

// The window a release is counted in for stability, and the score bounds the disagreements are read at
export const STABILITY_WINDOW_MONTHS = 24;
export const KEEP_DISAGREEMENT_MINIMUM_SCORE = 60;
export const ABSORB_DISAGREEMENT_MAXIMUM_SCORE = 30;

// The source a package's lines are counted from: the JavaScript it ships, never its declarations, source maps or a minified copy
export const MODULE_EXTENSIONS: string[] = [".js", ".mjs", ".cjs"];
export const MINIFIED_MARKER = ".min.";
// The suffixes a relative import may omit, tried in turn after the specifier as written
export const IMPLICIT_MODULE_SUFFIXES: string[] = ["", ".js", ".mjs", ".cjs", "/index.js"];
// The scope every declarations-only package is published under
export const TYPES_SCOPE = "@types/";
// Where a package's own dependencies sit: beside its realpath, under pnpm's store layout
export const NODE_MODULES_DIRECTORY = "node_modules";

// One `git grep` finds every import of a package in the tracked source, matching `from "<name>"`, `import("<name>"` and a
// Side-effect `import "<name>"` opening its line
export const IMPORT_GREP_PATTERN: string = String.raw`(from|import\(|^\s*import)\s*"[^"]+"`;
export const IMPORT_GREP_PATHSPECS: string[] = ["*.ts", "*.vue", "*.mjs", "*.js"];

// The type workarounds a package forces on us, one `git grep` finding each of the three: a module declared over it, a
// Directive suppressing an error at its import, and a cast at its call
export const TYPE_SHIM_PATTERN = `@ts-expect-error|as unknown as|declare module "`;
// The lines either side of a directive or a cast that an import or a call must fall within to be counted against a package
export const SHIM_LINE_WINDOW = 3;
// The reasons a Keep verdict keeps a package whose type workarounds absorbing it would fix at the root
export const SHIM_EXEMPT_REASONS: string[] = CORE_EXEMPT_REASONS;

// The app whose client bundle the report is read from, against the repository root
export const APP_DIRECTORY = "apps/web";
// How many of the largest bundle costs the report ends on
export const TOP_BUNDLE_COUNT = 25;
// The package the app's own code is attributed to in the client bundle report, and the report the score's `nuxt analyze`
// Run writes beside the app's build output, against the app, which the bundle column reads
export const APP_PACKAGE_NAME = "@esposter/web";
export const CLIENT_BUNDLE_REPORT_PATH = ".nuxt/analyze/client.json";
// The reason a catalog package the client build does not contain is given, in place of its bundle bytes
export const NOT_IN_CLIENT_SKIP_REASON = "not in client";
// A module id's query, such as the hash Vite appends, which is no part of the file's own path
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation
export const QUERY_REGEX: RegExp = /\?.*$/u;
