// The ` -- ` separator both linters read as the start of a directive's description, with something after it. Both
// Halves of the directive-reason check read it — oxlint's `comments/require-directive-reason` in `scripts/` and the
// Template half in `plugins/directives.js` — so the two cannot disagree on what counts as a reason.
export default /\s--\s+\S/u;
