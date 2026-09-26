# A Pull That Stops on a Conflict

Read when `git pull --rebase` on `ai/queue` stops on a conflict. The loop is in `SKILL.md`; this page is how each conflict is settled.

A pull that stops on a conflict is resolved in the rebase, one commit at a time. A commit whose subject is already in `git log <merge-base>..origin/ai/queue` is one the collector ported and re-resolved, so the remote's copy is the right one: `git rebase --skip` — once `git show --stat` of that remote commit names the same files as `git show --stat REBASE_HEAD`, since a subject alone (`chore: format`) can belong to another session's commit. Any other conflict is the session's own commit meeting the remote's changes, so both are kept, merged by hand, then `git add` and `git rebase --continue`. Afterwards, `git diff origin/ai/queue --stat` should show only the session's unported commits.
