# Rule cost

Read when writing or reviewing a selector-ban entry or a JS plugin rule, or when one of them tops the timings table. Every lint runs every rule over every file, so a rule's cost is paid on each run, by every session and CI job.

## Measure before and after

- **The `Calls` column of `--debug=timings` is the measure; `Time (ms)` is not.** Calls are the same on every run of the same tree, and time moves with the machine's load. A one-off config (`vp lint -c <scratch>.json --debug=timings`) with only the rule under study runs it over the whole repository in seconds.
- **Compare a change by time only A/B on one machine, alternating the two versions** a few rounds, and keep it only when it wins. A rewrite that is better on paper can lose on the repository's real sizes: a linear dependency walk for the sort rules ran slower than the quadratic scan it replaced, because the repository's objects are small, and it was reverted.

## Selectors

- **oxlint calls a selector once per node of its subject's type**, the rightmost compound, in each file the list's `files` covers. Each entry pays this separately, so an entry on `CallExpression` pays for every call in its scope.
- **Never end a selector on `Identifier`, the commonest node, when a rarer node can be the subject.** Anchor on the node that owns it and check the identifier from there:
  - a child, with `:has(> Identifier[name='view'])` after the cheap attribute filters, so the subtree is only read on a call that already matched;
  - a parameter of a fixed arity, with positional attributes (`:function:matches([params.0.name=…], [params.1.name=…])`).

  The report then lands on the owner rather than on the identifier, and a fixture's violation count follows it.

- **A subject with no type runs on every node**: `*`, a bare `:not(…)`, a bare attribute, or a `:matches(…)` with any such branch. Give every branch a node type.
- **Scope a list's `files` to the trees its convention covers**, since an entry costs nothing in a file it is not run on.

## JS plugin rules

- **Return `{}` from `create` when the file cannot report.** When a rule can only fire on a name written in the file, test `context.sourceCode.text.includes(name)` first (`pinia/no-return-global-properties`). The gate must be exact: a name that escapes can hide in a string (`naming/no-site-name-literal`) is checked per string instead.
- **Rule out a node by its own fields before a scope lookup.** `sourceCode.getScope(node).references.find(…)` scans a scope per call. Compare names first, and only read the scope for a node that can still match (`sequential-loops/no-async-self-call`).
- **State kept across files is indexed by its key, never scanned per node.** A module-level map from the key to its files answers in one lookup, where a walk over every file read so far grows with the run (`pinia/no-duplicate-store-ids`).
- **Do the expensive check last and once**: a cheap necessary condition first (`includes(":")` before parsing an address), then one parse (`URL.parse`, not `URL.canParse` followed by `new URL`).
- **Work that depends only on the file is done once in `create`**, never in a per-node visitor.
