// oxlint-disable-next-line typescript/no-inferrable-types
// Accepts either a quoted value ('value') or the bare null literal (null)
export const CLAUSE_REGEX: RegExp = /^(?<key>[A-Za-z0-9_]+)\s+(?<operator>eq|gt|ge|lt|le)\s+(?<value>'[^']+'|null)$/i;
