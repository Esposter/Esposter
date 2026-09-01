import eslintConfiguration from "@esposter/configuration/eslint/index.typescript.js";

// `packages` is the only ignore this file owns: every package lints itself with its own flat config, and a root
// `eslint .` that walked them would apply this file's rules instead of theirs. Everything else a repo-wide walk has
// To skip — the `.claude` alias, `.agents/worktrees` — arrives from `.oxlintrc.json`'s `ignorePatterns`, which the
// Shared config bridges into flat-config global `ignores` through `eslint-plugin-oxlint`. Repeating one here reads
// As the rule's owner and drifts from the list that actually governs both linters.
export default eslintConfiguration.append({ ignores: ["packages"] });
