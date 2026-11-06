// The word that makes a package headless when it is in the package's name or among its keywords
export const HEADLESS_KEYWORD = "headless";
// Vue, one or more kebab segments, then the keyword: the name every headless package follows
export const HEADLESS_NAME_REGEX: RegExp = new RegExp(
  String.raw`^vue-[a-z\d]+(?:-[a-z\d]+)*-${RegExp.escape(HEADLESS_KEYWORD)}$`,
  "u",
);
const PINIA_PACKAGE_NAME = "pinia";
const PINIA_SCOPE = "@pinia/";
// Pinia itself, or any package under its scope, as the name a module specifier holds
const PINIA_NAME_SOURCE = String.raw`(?:${RegExp.escape(PINIA_PACKAGE_NAME)}|${RegExp.escape(PINIA_SCOPE)}[^"'\n]*)`;
// A module named by `from "…"`, `import "…"` or `import("…")`, where the name is one of Pinia's
export const PINIA_IMPORT_REGEX: RegExp = new RegExp(
  String.raw`(?:\bfrom\s*|\bimport\s*\(?\s*)["']${PINIA_NAME_SOURCE}["']`,
  "u",
);
