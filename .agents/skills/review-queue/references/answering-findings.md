# Answering a Finding In-Session

Read when the session fixes a CodeRabbit finding itself, rather than leaving it to the collector's drain.

A finding the session fixes itself is a commit on `ai/queue` carrying the trailer `Answers: <comment id>` (a body-only finding: `Drains: <review id>`). The collector's open-finding predicate honours a trailer on the queue's unported commits, so it neither re-fixes the finding nor replies before the commit is on `develop`. It ports in queue order, not first — only `ai/review-fixes` commits lead a window — so the wait is the cost of answering in-session rather than leaving the drain to it. A rejection needs no sha and may be replied to directly; the reply's shape is the `coderabbit` skill's.
