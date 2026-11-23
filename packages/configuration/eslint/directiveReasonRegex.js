// The ` -- ` separator both linters read as the start of a directive's description, with something after it. Both
// Halves of the directive-reason check read it — oxlint's `comments/require-directive-reason` in `scripts/` and the
// Template half in `scripts/src/workspace/templateDirectiveReasons.test.ts` — so the two cannot disagree on what counts
// As a reason.
export default /\s--\s+\S/u;
