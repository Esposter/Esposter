// The word that makes a package headless when it is in the package's name or among its keywords
export const HEADLESS_KEYWORD = "headless";
// The prefix a headless package that ships a Vue abstraction takes, so its name says Vue
export const VUE_PACKAGE_PREFIX = "vue-";
// One or more kebab segments: what a headless package's name says it is
const THING_NAME_SOURCE = String.raw`[a-z\d]+(?:-[a-z\d]+)*`;
// A whole package name that a regex source matches
const wholeNameRegex = (nameSource: string): RegExp => new RegExp(String.raw`^${nameSource}$`, "u");
// Vue, then what it is, then -headless: the name of a headless package that ships a Vue abstraction
export const VUE_HEADLESS_NAME_REGEX: RegExp = wholeNameRegex(
  `${RegExp.escape(VUE_PACKAGE_PREFIX)}${THING_NAME_SOURCE}-${RegExp.escape(HEADLESS_KEYWORD)}`,
);
// What it is, then -headless, with no Vue prefix: the name of a framework-free headless engine
export const FRAMEWORK_FREE_HEADLESS_NAME_REGEX: RegExp = wholeNameRegex(
  `${THING_NAME_SOURCE}-${RegExp.escape(HEADLESS_KEYWORD)}`,
);
// The import site of a module named by `from "…"`, `import "…"` or `import("…")`, with the name a regex source
const importRegex = (nameSource: string): RegExp =>
  new RegExp(String.raw`(?:\bfrom\s*|\bimport\s*\(?\s*)["']${nameSource}["']`, "u");
export const VUE_PACKAGE_NAME = "vue";
// A module named by `from "vue"`, `import "vue"` or `import("vue")`: a source file that holds one uses Vue
export const VUE_IMPORT_REGEX: RegExp = importRegex(RegExp.escape(VUE_PACKAGE_NAME));
const PINIA_PACKAGE_NAME = "pinia";
const PINIA_SCOPE = "@pinia/";
// Pinia itself, or any package under its scope, as the name a module specifier holds
const PINIA_NAME_SOURCE = String.raw`(?:${RegExp.escape(PINIA_PACKAGE_NAME)}|${RegExp.escape(PINIA_SCOPE)}[^"'\n]*)`;
// A module named by `from "…"`, `import "…"` or `import("…")`, where the name is one of Pinia's
export const PINIA_IMPORT_REGEX: RegExp = importRegex(PINIA_NAME_SOURCE);
// The package a Nuxt module depends on at runtime, and which only a Nuxt module declares, so a dependency on it is what makes a package one
export const NUXT_KIT_PACKAGE_NAME = "@nuxt/kit";
// The frameworks a framework-free headless package declares none of and imports none of, by package name
export const FRAMEWORK_PACKAGE_NAMES: readonly string[] = [
  VUE_PACKAGE_NAME,
  PINIA_PACKAGE_NAME,
  "phaser",
  "three",
  "react",
];
// A module named by one of those frameworks, or by a subpath of one, which a framework-free headless package never holds
export const FRAMEWORK_IMPORT_REGEX: RegExp = importRegex(
  String.raw`(?:${FRAMEWORK_PACKAGE_NAMES.map((name) => RegExp.escape(name)).join("|")})(?:/[^"'\n]*)?`,
);
