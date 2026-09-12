// Modifiers sit between `export` and the declaration keyword: `async` before a function, `declare` before any
// Of them in an ambient file, `abstract` before a class — and an ambient abstract class carries two of them.
const EXPORT_REGEX =
  /^export (?:(?:abstract|async|declare) )*(?:class|const|enum|function|interface|type) (?<name>[A-Za-z0-9_$]+)/gmu;

// Every name a module exports at its top level. Line-anchored on purpose: `export` inside a block is a syntax
// Error, and a re-export (`export * from …`) names nothing of its own.
export const getExportNames = (text: string): string[] =>
  Array.from(text.matchAll(EXPORT_REGEX), (match) => match.groups?.name ?? "");
