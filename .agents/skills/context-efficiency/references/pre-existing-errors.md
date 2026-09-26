# Is This Error Mine?

Read when a check reports errors in files the change never touched, or when calling a failure pre-existing.

Generated types go stale, and workspace `dist` output goes stale faster — a typecheck reporting that `@esposter/db` "has no exported member" something long-standing is a build artifact, not a regression. Rebuild the packages the errors name and re-run before reading a single one of them. The question is never "are there errors", it is **"does my change add errors"**.

**"Pre-existing" means pre-dating the change, and HEAD is not that.** On a branch where the work is committed as it goes, HEAD already contains the change under suspicion, so "it fails at HEAD too" proves only that the failure isn't from the uncommitted edit on top. Pick the commit before the one that touched the relevant file (`git log --stat -- <path>`) and check the source there with `git show <sha>:<path>` — never `git stash`, which is banned repo-wide. Getting this wrong inverts the conclusion: a real regression gets filed as unrelated and shipped.
