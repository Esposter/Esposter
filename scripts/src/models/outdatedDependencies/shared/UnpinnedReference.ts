// A reference the report cannot check — a tag naming no version, or a version with no digest pinned beside it —
// With the file that declares it, and the package it names, which a `renovate.json` rule may have switched off
export interface UnpinnedReference {
  packageName: string;
  path: string;
  reference: string;
}
