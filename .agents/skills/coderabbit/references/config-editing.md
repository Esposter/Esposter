# Editing `.coderabbit.yaml`

Read when changing the config a review applies. CodeRabbit reads it from the PR's **base branch**, so the edit lands there, not on the branch carrying the work.

Read the base off the PR rather than assuming it — feature PRs target `develop`, the release PR is `develop` → `main`:

```bash
gh pr view <pr> --json baseRefName --jq .baseRefName   # the branch whose config applies
git show <base-branch>:.coderabbit.yaml | head -20     # the config CodeRabbit actually applies
```

Commit it **directly to that base branch**, standalone, separate from the work it covers. Landing anything on a shared branch needs the same explicit go-ahead every push does — including the API call below, which does not look like a push but is one.

## The worktree, and the Windows fallback

Editing the base branch is not checking it out over your work:

```bash
git worktree add <scratch-path> <base-branch>   # commit there, push, then: git worktree remove
```

The working tree keeps whatever is in flight, which matters when agents are mid-edit in it. Rebase inside the worktree before pushing — the base branch moves under you (Renovate).

**On Windows the worktree can fail outright**: checking this repo out under a long scratch path trips `Filename too long` on the deepest `packages/infra` paths and aborts with `Could not reset index file`. For a one-file config edit, skip the checkout and commit through the API, which is atomic and cannot disturb the working tree:

```bash
baseBranch=$(gh pr view <pr> --json baseRefName --jq .baseRefName)
sha=$(gh api "repos/:owner/:repo/contents/.coderabbit.yaml?ref=$baseBranch" --jq .sha)
gh api -X PUT "repos/:owner/:repo/contents/.coderabbit.yaml" \
  -f message="$(cat message.txt)" -f content="$(base64 -w0 new.yaml)" -f sha="$sha" -f branch="$baseBranch"
```

Both calls take the resolved base, never a hardcoded `main` — read and write must name the same branch, or the PUT lands config on a branch whose `sha` it was not read from and the API rejects it. On a `develop`-base PR a hardcoded pair would instead write config `main` reads and the review never does.

Validate the yaml parses (`exclusions.md` § Generating the list) _before_ the PUT — there is no local commit to amend afterwards.

The two branches diverging is expected: `develop` can carry a temporary exclusion block while `main` carries only the permanent entries, picking the block up on a release merge and losing it when the block is removed.
