const EXPORT_REGEX = /^export (?:class|const|enum|function|interface|type) (?<name>[A-Za-z0-9_$]+)/gmu;

// Every name a module exports at its top level. Line-anchored on purpose: `export` inside a block is a syntax
// Error, and a re-export (`export * from …`) names nothing of its own.
export const getExportNames = (text: string): string[] =>
  [...text.matchAll(EXPORT_REGEX)].map((match) => match.groups?.name ?? "");
