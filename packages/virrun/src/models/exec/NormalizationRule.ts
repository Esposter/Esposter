// A single explicit substitution applied to a command's stdout/stderr before a differential comparison,
// So unavoidable nondeterminism (epoch timestamps, absolute temp paths, ordering) is masked identically on
// Both the sandbox and the native result. Nothing is ever normalized implicitly — each rule is opt-in per
// Corpus case — so a real divergence is never silently hidden. See features/virrun/specs/correctness.md.
export interface NormalizationRule {
  // Must carry the global flag — normalizeExecResult applies it with replaceAll, which throws on a non-global
  // RegExp and would otherwise mask only the first match.
  pattern: RegExp;
  // What replaces every match. A stable token such as `<digits>` keeps the surrounding structure diffable.
  placeholder: string;
}
