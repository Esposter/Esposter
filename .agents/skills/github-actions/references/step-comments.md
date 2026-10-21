# Step Comments

Read when writing or reviewing a comment in a workflow file or a composite action. The one-line rule is in `SKILL.md`; this page is its reasoning.

The argument for a job's shape lives in the page that owns it (`SKILL.md`, "Owned elsewhere"); a workflow comment that carries it a second time drifts the moment the page moves. The file header names the page, and each step's comment keeps only what a reader could not get from there or from the step itself — an ordering constraint (`GITHUB_ENV` reaches only the steps after it), a platform quirk (the `concurrency.queue` key the upstream linter does not know), a gate's failure mode (a `path` list that drifted still reports a hit).
