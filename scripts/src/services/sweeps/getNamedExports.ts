import type { NamedExport } from "#src/models/sweeps/NamedExport";

// Modifiers sit between `export` and the declaration keyword: `async` before a function, `declare` before any of them in
// An ambient file, `abstract` before a class — and an ambient abstract class carries two of them. Line-anchored on
// Purpose: `export` inside a block is a syntax error, and a re-export (`export * from …`) names nothing of its own
const EXPORT_REGEX =
  /^export (?:(?:abstract|async|declare) )*(?<kind>class|const|enum|function|interface|let|type) (?<name>[\w$]+)/gmu;
// Every named export a module declares at its top level, with the keyword it is declared by
export const getNamedExports = (text: string): NamedExport[] =>
  Array.from(text.matchAll(EXPORT_REGEX), ({ groups }) => ({ kind: groups?.kind ?? "", name: groups?.name ?? "" }));
