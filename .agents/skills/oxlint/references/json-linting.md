# JSON Linting

Read when changing how the repo's JSON is linted, adding a JSONC file, or when one package's lint takes far longer than the rest.

## JSON linting — `eslint-plugin-jsonc`, and the manifest exception

`plugins/json.js` runs the plugin's recommended set over the repo's JSON — oxlint lints no JSON at all, so nothing here is a duplicate. Three things about the wiring are not guessable:

- **`recommended-with-json` bans comments, so a JSONC file needs the other config.** `recommended-with-jsonc` is the same set minus `jsonc/no-comments`, and the files that take it are JSONC by contract rather than by extension — the editor settings and the tsconfigs. Matched by the wrong one, a comment is a hard parse failure rather than a rule report.
- **A manifest stays on `@eslint/json`.** `depend/ban-dependencies` (`plugins/depend.js`) listens on `Document > Object > Member`, which is momoa's AST and not the ESTree-shaped tree this plugin parses to — and a file carries exactly one `language`. A jsonc entry reaching a manifest leaves that rule matching nothing, which looks exactly like passing, so manifests are excluded here rather than covered twice.
- **Generated JSON is excluded** — migration snapshots, asset blobs and vitest file snapshots are written and re-read by their generators. They are also most of the JSON in the repo, so the exclusion is most of the run, and a tree missing from it is **invisible**: the files lint green, they just take the time. So the tell is a **duration**, not a diagnostic — when one package's lint dwarfs the rest, count the JSON it walks (`eslint . -f json`, grouped by directory) before looking at its rules. The standing cross-check is `oxfmt.config.ts`'s `ignorePatterns`: the formatter and the linter walk the same trees, so a generated directory named in one and absent from the other is the gap.

**Don't add `jsonc/sort-keys`.** It ships in `flat/all` rather than in either recommended set, and alphabetical is the wrong order for the files it would reach: it wants `description` before `version` and `devDependencies` before `scripts` in a manifest, and the generated snapshots underneath it are not ours to reorder.

The `**/*.json` glob itself lives in `eslint/jsonFilePatterns.js` because three configs have to agree on it — the one that lints JSON, plus `nuxt/javascript` and perfectionist, which match every file and would otherwise run script rules against a JSON AST.
