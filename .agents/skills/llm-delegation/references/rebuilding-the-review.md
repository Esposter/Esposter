# Rebuilding the Review

Read when a batch commits a change to the review's own workflow or code, which disables the review workflow while the batch commits.

The review runs the code on `ai/queue`, so a batch committing a change to the review's code would run each half-wired step against GitHub the moment it is pushed. While such a batch commits, the review's workflow is disabled (`gh workflow disable Review.yaml`). It is enabled again once the change is reviewed, fixed and pushed. Running the review by hand is its dispatch with the `from` and `to` inputs, documented in `openspec/specs/infra/review/design.md`.

- **A new wave is a new inline script.** Re-invoking a workflow by its `scriptPath` reruns that same wave, with its own agents and labels, whatever `args` it is handed. Passing an older wave's path to start a different one launches a duplicate of the older wave. Write each new wave's script inline, and use `scriptPath` only to resume or re-run that very script.
