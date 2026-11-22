// The import site of a module named by `from "…"`, `import "…"` or `import("…")`, with the name a regex source
export const importRegex = (nameSource: string): RegExp =>
  new RegExp(String.raw`(?:\bfrom\s*|\bimport\s*\(?\s*)["']${nameSource}["']`, "u");
