# Reusable Workflows and Secrets

Read when calling a reusable workflow that reads secrets.

A call that hands its secrets over is `secrets: inherit`; the callee reads `secrets.*` in its steps and declares nothing under `on.workflow_call.secrets`. A named list is least privilege only where a secret is otherwise out of a branch's reach, and here none is: `CI.yaml` runs on a push to every branch with the repository's whole secret set, so what a step on any ref can read is decided there, not by the call. What a list does cost is a second contract: a callee pinned to another ref is two copies a release lag pulls apart, and the moment either side grows a secret the other has not seen, GitHub refuses the call at startup on the events reading the stale copy — a failure no run can heal, since healing needs a run. Narrowing what a branch can reach, if it is ever wanted, is an environment with a branch policy on the deploy job, not a list on a call.
