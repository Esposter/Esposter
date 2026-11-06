// The word that makes a package headless when it is in the package's name or among its keywords
export const HEADLESS_KEYWORD = "headless";
// Vue, one or more kebab segments, then the keyword: the name every headless package follows
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this RegExp constructor would otherwise infer
export const HEADLESS_NAME_REGEX: RegExp = new RegExp(
  String.raw`^vue-[a-z\d]+(?:-[a-z\d]+)*-${RegExp.escape(HEADLESS_KEYWORD)}$`,
  "u",
);
const VUE_PACKAGE_NAME = "vue";
// A module named by `from "vue"`, `import "vue"` or `import("vue")`: a source file that holds one uses Vue
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this RegExp constructor would otherwise infer
export const VUE_IMPORT_REGEX: RegExp = new RegExp(
  String.raw`(?:\bfrom\s*|\bimport\s*\(?\s*)["']${RegExp.escape(VUE_PACKAGE_NAME)}["']`,
  "u",
);
const PINIA_PACKAGE_NAME = "pinia";
const PINIA_SCOPE = "@pinia/";
// Pinia itself, or any package under its scope, as the name a module specifier holds
const PINIA_NAME_SOURCE = String.raw`(?:${RegExp.escape(PINIA_PACKAGE_NAME)}|${RegExp.escape(PINIA_SCOPE)}[^"'\n]*)`;
// A module named by `from "…"`, `import "…"` or `import("…")`, where the name is one of Pinia's
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this RegExp constructor would otherwise infer
export const PINIA_IMPORT_REGEX: RegExp = new RegExp(
  String.raw`(?:\bfrom\s*|\bimport\s*\(?\s*)["']${PINIA_NAME_SOURCE}["']`,
  "u",
);
