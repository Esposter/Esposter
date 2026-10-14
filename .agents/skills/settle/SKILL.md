---
name: settle
description: Apply when the `/settle` command is run, or when the open `review` GitHub issues from this session are to be settled here, locally, rather than left to the review's settle job. The session-run counterpart of the review's settle job, with its verdicts decided by the main session.
---

# Settle — the open review issues, locally

`/settle` runs the procedure in `.agents/skills/review-queue/references/local-settle.md`.
The main session decides every verdict; haiku subagents make the edits.
This never pushes `main`, which moves only through the review's fast-forward.
Any issue left open stays with the review's settle job.
`/settle <issue number>` runs the procedure for that one issue only.
