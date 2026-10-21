# Exit Codes in a Step

Read when a step's command can fail and a `|| true` is about to be written to make it pass. The one-line rule is in `SKILL.md`; this page is its reasoning.

`|| true` on a command that is _already_ idempotent is dead syntax that can only ever hide a real failure — a revoked role, a resource mid-delete — which then resurfaces one step later as something that reads like a different bug. Check whether the tool is idempotent before reaching for it (`az storage container create` is: an existing container is `created: false`, exit 0).
