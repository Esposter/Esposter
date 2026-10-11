# A Pull That Stops on a Conflict

Read when `git pull --rebase` on `ai/queue` stops on a conflict. The loop is in `SKILL.md`; this page is how each conflict is settled.

The agent that made a commit settles a conflict in its own `git pull --rebase`, one commit at a time, by these rules.

`git rebase` skips a local commit whose patch the new base already carries, matched by patch-id. Where the collector changed a ported commit, the rebase stops on that commit, and the agent settles it there: when the change is already in `origin/ai/queue` or `develop`, `git rebase --skip` keeps the remote's copy; otherwise it is the session's own commit meeting the remote's changes, so both are kept, merged by hand, then `git add` and `git rebase --continue`. **Neither side is ever taken whole** — `git checkout --ours` or `--theirs` over a conflicted file drops every change the other side made, conflicting hunk or not. Read what each side changed against the merge base (`git diff REBASE_HEAD~1 REBASE_HEAD -- <file>` for the replayed commit, `git log -p <merge-base>..origin/ai/queue -- <file>` for the remote) and keep the substance of both: where one side's design replaces the other's, whatever the replaced side fixed is carried into the new design rather than dropped with it. Afterwards, `git diff origin/ai/queue --stat` should show only the session's unported commits.
