import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { LEDGER_DIRECTORY } from "#src/services/sweeps/constants";
import { join } from "node:path";

// The folder a component sits under, inside its package: a component's name is its path from here
export const COMPONENTS_SEGMENT = "/src/components/";
// The genshin packages are the ones whose names start with this; a package with a components folder is a screen root
export const GENSHIN_PACKAGE_PREFIX = "genshin-";
// The ledger a component owed a reference is recorded in, one row per component folder
export const COMPONENT_REFERENCE_LEDGER_PATH: string = join(
  REPOSITORY_ROOT,
  LEDGER_DIRECTORY,
  "component-reference.md",
);
// A row's first cell, a backticked folder
export const LEDGER_ROW_REGEX = /^\| `(?<folder>[^`]+)`/gmu;
// A component's own path, as a spec names it
export const COMPONENT_PATH_REGEX = /packages\/[\w.@/-]+\/src\/components\/[\w./-]+\.vue/gu;
// A reference a spec line names: a recording or capture, the game's own extracted UI or text, or a wiki page
export const REFERENCE_TOKEN_REGEX =
  /genshin-parity\/(?:references|captures|extracted|text)\/|\byt-[\w-]{6,}|genshin-wiki\/|fandom\.com|youtube\.com/u;
// A component file the package imports by path, relative or through `#src`, or lazily through a dynamic import
export const PATH_IMPORT_REGEX = /(?:from\s+|import\(\s*)"(?<specifier>[^"]+\.vue)"/gu;
// A named import from a genshin package, whose names the package's components barrel resolves
export const PACKAGE_IMPORT_REGEX = /import\s+(?:type\s+)?\{(?<names>[^}]*)\}\s+from\s+"(?<package>genshin-[\w-]+)"/gu;
// One named export of a components barrel, each re-exporting its component file
export const BARREL_EXPORT_REGEX = /export \{ default as (?<name>\w+) \} from "\.\/(?<file>[^"]+\.vue)";/gu;
// A component's top-level template, read off its SFC's own column so a nested `<template>` is not taken for it
export const TOP_LEVEL_TEMPLATE_REGEX = /^<template>(?<body>[\s\S]*?)^<\/template>/mu;
// A native tag an SFC template opens: a hyphenated tag is a component the template mounts, so it is not matched at all.
// The tags that draw nothing of their own are Vue's template, slot and dynamic component
export const TEMPLATE_TAG_REGEX = /<(?<tag>[a-z]\w*)(?![\w-])/gu;
export const NON_DRAWING_TAGS: ReadonlySet<string> = new Set(["component", "slot", "template"]);
