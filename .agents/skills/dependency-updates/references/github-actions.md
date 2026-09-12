# Updating a GitHub Action

Read when bumping an action under `.github/workflows/` or `.github/actions/` to a new release. This page holds the whole procedure; `SKILL.md` keeps the one line that an action is pinned to a dereferenced commit SHA.

GitHub Actions steps in `.github/workflows/` and `.github/actions/` are pinned to 40-character commit SHAs followed by a version comment (e.g., `uses: <owner>/<action>@<commit-sha> # v<version>`).

When updating a GitHub Action to a new release tag:

1. Fetch tags from the remote repo:
   ```bash
   git ls-remote --tags https://github.com/<owner>/<repo>.git "refs/tags/<version>*"
   ```
2. **Dereference annotated tags**:
   - Annotated tags produce two output lines: `refs/tags/<version>` (the Git tag object SHA) and `refs/tags/<version>^{}` (the dereferenced target commit SHA).
   - **Always use the dereferenced commit SHA (`refs/tags/<version>^{}`)**. Using the tag object SHA will fail to resolve in GitHub Actions.
   - If the tag is lightweight (unannotated), only `refs/tags/<version>` is returned; use that SHA.
