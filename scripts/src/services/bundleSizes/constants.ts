export const BUNDLE_SIZES_FILENAME = "bundle-sizes.md";
// The files whose bytes follow the folder the repository is checked out in: the SFC compiler hashes the file's absolute
// Path into each `v-bind` variable name in a style block, and the names differ in length by a few bytes. Written as
// `<package name>/<file under dist>`
// @TODO: no upstream issue — the SFC compiler's `v-bind` variable names hash an absolute path, which makes a build depend on where it ran
export const CHECKOUT_DEPENDENT_FILES: ReadonlySet<string> = new Set([
  "genshin-interface/index.js",
  "genshin-interface/style.css",
  "genshin-world/index.js",
  "genshin-world/style.css",
]);
// How far a checkout-dependent file may sit from its recorded size, far above the few bytes a path moves it
export const CHECKOUT_DEPENDENT_TOLERANCE_BYTES = 64;
