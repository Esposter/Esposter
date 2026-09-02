// Which barrel a package generates before it builds — one option with three answers rather than a pair of
// Flags that could be set to a combination meaning nothing.
//
// A union of literals rather than an enum, and that is load-bearing rather than taste: this package's own
// `tsdown.config.ts` reaches its source through `#src/*`, and tsdown loads a config with Node's strip-only
// Type stripping, which refuses an enum outright ("TypeScript enum is not supported in strip-only mode"). A
// Type erases to nothing, so nothing reaches the loader. It is also the shape the options it sits beside
// Already take — tsdown's own `platform` and `dts.generator` are literal unions.
//
// - "none": a package that names its entrypoints itself, so a barrel would be a file nothing is an entry for.
// - "vue": the component barrel too, ahead of the TypeScript one, because that one then reaches it.
export type ExportsGeneration = "none" | "typescript" | "vue";
