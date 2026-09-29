# Upstream Audit

Read when reading a package's tracker, or giving an issue its verdict. The four verdicts and the order they are decided in are `apps/web/content/docs/architecture/dependency-admission.md` ("Triage"); this page is how the audit is run and what evidence each verdict needs.

## Reading the tracker

List everything, then read each issue with its comments — the title alone misattributes more often than not, because an adapter sits where two dependencies meet and is blamed for both. Read bodies and comments from the API rather than `gh issue view --comments`, which prints the comments alone once its output is not a terminal, so every issue loses the report it answers:

```bash
gh api "repos/<owner>/<repo>/issues?state=all&per_page=100" --paginate --jq '.[] | "#\(.number) \(.title)\n\(.body)"'
gh api "repos/<owner>/<repo>/issues/comments?per_page=100" --paginate --jq '.[] | "#\(.issue_url | split("/") | last) @\(.user.login): \(.body)"'
```

A verdict table that groups issues is generated rather than typed: a map of issue numbers to verdict and proof, checked to name every issue and pull request exactly once before the table is written.

Read the package's source alongside — the installed copy under `node_modules/.pnpm`, or its `src` when it ships one — since "does the behaviour live in the adapter's code" is answered by the code, not by the thread.

## Running a regression test against the upstream package

The test is written against the replacement, then pointed at the upstream export from a throwaway Vitest config beside it — the installed copy under `node_modules/.pnpm` imported by absolute path, `server.deps.inline` over it so the config's aliases reach it, and an alias for any virtual module it imports (`"#imports": "h3"` for a Nuxt runtime) — and deleted once it has run. A test that passes there too is recorded as such: the defect was fixed upstream, by the package or a neighbour it depends on, and the test stays as the pin rather than as a reproduction.

## Evidence per verdict

- **In scope — defect.** A reproduction against the upstream package: a test in the new package's suite that fails on the upstream code and passes on ours. Its title names the issue (`#43 reads FormData mutation input`), which is what lets the Upstream table point at it.
- **In scope — feature.** The test that exercises it. Implemented whether or not our app calls it.
- **Out of scope.** The owning dependency, named, with the line of its source or its issue that proves the behaviour is there. When the constraint reaches us, the page that owns our side records it — measured where it can be, with a test pinning the measurement so the reason cannot go stale unnoticed.
- **False positive.** Which kind — usage question, documentation gap, duplicate, fixed by a later upstream release — and the link that shows it: the answering comment, the duplicate issue, the release.

Pull requests carry the same information as issues when a tracker routes fixes through them; an open, unmerged fix is read as the issue it closes.
