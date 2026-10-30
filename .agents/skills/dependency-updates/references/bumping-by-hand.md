# Bumping by Hand

Read when taking a bump ahead of Renovate, by hand, from the repo root.

If the very first `pnpm` command dies inside the app's `postinstall` (`nuxt prepare`, `Cannot find module '@nuxt/devtools-kit'`), that is `node_modules` drift blocking every script, not a lockfile problem: `pnpm i --force`, then `vp run build:packages`. → `openspec/specs/architecture/monorepo-tooling/design.md`

## First: what the bot's CI already found

Renovate has usually run the bump through every check before a person looks, so its branch's CI is the cheapest read of what a bump costs here. Read it before editing anything: a red branch is a migration to-do list written by CI, and a green one needs no hand pass at all.

```bash
# Open bump branches and the checks that are red on each
gh pr list --state open --search "head:renovate/" --json number,title,headRefName,statusCheckRollup \
  --jq '.[] | {n: .number, title, branch: .headRefName, red: [.statusCheckRollup[]? | select(.conclusion == "FAILURE") | .name]}'

# The distinct errors of one branch's failed run, with the job and step columns stripped
gh run list --branch <renovate-branch> --workflow CI.yaml --limit 3 --json databaseId,conclusion,createdAt
gh run view <run-id> --log-failed | sed 's/^[^\t]*\t[^\t]*\t//' | grep -E "error TS|error:|FAIL|×" | cut -c1-260 | sort | uniq -c | sort -rn | head -30
```

The same error repeated per package is one error; count the distinct ones. Then sort the red by what it asks of the repo:

- **A type or API change in our own code** (a member now declared upstream, a renamed export, a stricter signature, a modifier the compiler now demands) is a migration. When it is small and mechanical, take the bump and the migration together in one commit, since the change usually compiles only against the new version and so cannot land ahead of it. What the release changed is read from the two versions' own declaration files, packed into separate scratch directories and compared, rather than guessed from the notes:

  ```bash
  mkdir -p "$SCRATCH/old" "$SCRATCH/new"
  (cd "$SCRATCH/old" && npm pack <package>@<installed> --silent && tar -xzf ./*.tgz)
  (cd "$SCRATCH/new" && npm pack <package>@<target> --silent && tar -xzf ./*.tgz)
  diff -r "$SCRATCH/old/package" "$SCRATCH/new/package" | head -80
  ```

  A workaround the new release makes redundant is deleted in that commit, with the comment that explained it (`references/bump-follow-through.md`).

- **A snapshot or size check** is the follow-through, not a migration (`references/bump-follow-through.md`).
- **A failure the base branch has too** is not this bump's: compare against the latest CI run of the default branch before reading further.
- **A behaviour change with no replacement, or a migration too large for a bump** is a hold (`references/holding-a-dependency.md`), with the failure as the rule's `description`.
- **Green** is a bump the bot merges unaided.

A bump ahead of the bot follows the same path Renovate takes:

1. **Check what's outdated and mismatched**: `pnpm outdated:dependencies`. It reads every version Renovate reaches (`references/renovate.md` lists them), so the report and the bot cover the same set, and it lists apart the rows a `renovate.json` rule holds. A held row is not taken; changing that is a rule edit, not a bump.
2. **Update versions** in `pnpm-workspace.yaml` — every entry keeps its `^` unless `references/caret-rules.md` says otherwise. A row labelled with a tag is one of two kinds, told apart by its catalog entry. An `npm:` alias onto the tag has no version here to write: step 3 alone takes it (`references/dist-tag-aliases.md`). An entry a `followTag` rule points at a tag keeps a version, and is written like any other, at the version the row's Latest column names.
3. **Refresh the lockfile**: `pnpm refresh:lockfile`. It deletes `pnpm-lock.yaml` and every `node_modules` in the tree and installs from nothing, which is why it costs minutes rather than seconds. It first ends this workspace's node processes, because on Windows a running process holds open the native `.node` binaries the delete is about to remove; each worktree under `.agents/worktrees` is another session's workspace and is spared with its own processes. Anything of this repo's that is mid-run does go without asking — another session's vitest, a dev server — and each one restarts from where it was, so the one thing to expect is restarting your own dev server afterwards.

   The refresh is what the pass commits: the lockfile it writes is the one `node_modules` was verified against, and `pnpm install --lockfile-only` resolves the same versions under different peer-suffix keys, so it is a probe for what a catalog edit would resolve to and never the lockfile a commit carries.

4. **Verify dependency sync** — re-run `pnpm outdated:dependencies`; fix mismatches in `pnpm-workspace.yaml` and run `pnpm i`, which is enough: the lockfile already holds the resolved version, so a second `pnpm refresh:lockfile` is never needed for a specifier sync. A mismatch in the `npm` group is the manifest's own range against its `package-lock.json`, which the refresh never touches. That lockfile is npm's, not pnpm's: regenerate it with npm from a clean copy of the manifest, with no `node_modules` beside it, and never edit it by hand. The manifests with one are `packages/genshin-persona/package.json` and its `runtime/package.json`; Renovate moves their ranges and lockfiles, and the rule that neither lockfile is hand-edited is the persona plugin's (`openspec/specs/infra/claude-interface/persona-plugin/README.md`).

## Docker images

A `FROM` tag bump takes its digest from the registry, since Renovate writes both and no Docker daemon is needed. Fetch an anonymous pull token for the repository, request the tag's manifest with the OCI image index and Docker manifest list media types, and read `Docker-Content-Digest`. Check the method first on the tag the Dockerfile already pins: it must return that digest, or the lookup is reading the wrong object.
