# The `scripts/` layout

Read when adding a command, a sub-command or a plugin under the repo-root `scripts/`, or deciding where one of its services or types lives.

**`scripts/` is laid out by layer like the app, keyed by command** — `src/<command>/index.ts` is the entrypoint a pnpm script names (an oxlint plugin is `src/oxlint/<plugin>.ts`, the path `.oxlintrc.json` loads), and everything it runs lives under `src/services/<command>/` (its `constants.ts` included) with its types under `src/models/<command>/`. A sub-command (`coderabbit/<verb>`, `sweeps/<scan>`) nests one level deeper in each; what two verbs share sits at their command's root in the layer. The entrypoint folder holds nothing but the entrypoint and the platform scripts it dispatches to.
