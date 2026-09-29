# Upstream Audit

Read when reading a package's tracker, or giving an issue its verdict. The four verdicts and the order they are decided in are `apps/web/content/docs/architecture/dependency-admission.md` ("Triage"); this page is how the audit is run and what evidence each verdict needs.

## Reading the tracker

List everything, then read each issue with its comments — the title alone misattributes more often than not, because an adapter sits where two dependencies meet and is blamed for both:

```bash
gh issue list -R <owner>/<repo> --state all --limit 500 --json number,title,state
gh issue view <number> -R <owner>/<repo> --comments
```

Read the package's source alongside — the installed copy under `node_modules/.pnpm`, or its `src` when it ships one — since "does the behaviour live in the adapter's code" is answered by the code, not by the thread.

## Evidence per verdict

- **In scope — defect.** A reproduction against the upstream package: a test in the new package's suite that fails on the upstream code and passes on ours. Its title names the issue (`#43 reads FormData mutation input`), which is what lets the Upstream table point at it.
- **In scope — feature.** The test that exercises it. Implemented whether or not our app calls it.
- **Out of scope.** The owning dependency, named, with the line of its source or its issue that proves the behaviour is there. When the constraint reaches us, the page that owns our side records it — measured where it can be, with a test pinning the measurement so the reason cannot go stale unnoticed.
- **False positive.** Which kind — usage question, documentation gap, duplicate, fixed by a later upstream release — and the link that shows it: the answering comment, the duplicate issue, the release.

Pull requests carry the same information as issues when a tracker routes fixes through them; an open, unmerged fix is read as the issue it closes.
