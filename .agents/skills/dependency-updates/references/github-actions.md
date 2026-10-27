# Updating a GitHub Action

Read when bumping an action under `.github/workflows/` or `.github/actions/` to a new release. That an action is pinned to a dereferenced commit SHA is `SKILL.md`'s; this page is the bump.

When updating a GitHub Action to its latest stable release tag, `vX.Y.Z`, never a broad alias such as `v6` or a pre-release:

1. Fetch tags from the remote repo:
   ```bash
   git ls-remote --tags https://github.com/<owner>/<repo>.git "refs/tags/<version>*"
   ```
2. **Dereference annotated tags**:
   - Annotated tags produce two output lines: `refs/tags/<version>` (the Git tag object SHA) and `refs/tags/<version>^{}` (the dereferenced target commit SHA).
   - **Always use the dereferenced commit SHA (`refs/tags/<version>^{}`)**. Using the tag object SHA will fail to resolve in GitHub Actions.
   - If the tag is lightweight (unannotated), only `refs/tags/<version>` is returned; use that SHA.
