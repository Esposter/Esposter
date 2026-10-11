# Headless Sessions

Read when automation launches a headless session: which model its role takes, and the gate that must be able to decline it.

Each headless session the automation launches is one role, and its model is read off `SessionRoleModelMap` (`scripts/src/services/coderabbit/collect/constants.ts`) at the call site rather than off one constant every role shares. The map is total over the roles, so a role added does not compile until it has been priced, and a role moved to another family — another vendor's — is one line. `scripts/src/services/coderabbit/collect/runSession.ts` is the one launcher, and it takes the model rather than picking it.

**Every role runs on haiku, as every subagent does** (the `llm-delegation` skill's Settled list). The reconciliation roles are proved by the tree they left rather than trusted, and the carry role's rules are written into its prompt. The headroom is still bought first at the gate below, where a question skips its session entirely.

## Every spawn owes a gate that can decline it

No session is launched unconditionally. Before the spawn stands one of three gates, in this order of preference: a deterministic check that the work exists at all (`scripts/src/services/coderabbit/collect/resolveLockfileConflicts.ts`), a typed decision that answers the question without one (`scripts/src/services/triage/readTriageLabel.ts`), or a recorded marker from an earlier run that this run re-applies rather than re-deciding (the session limit marker, `scripts/src/services/coderabbit/collect/readSessionLimitResetMs.ts`). A run that spawns a session to discover there was nothing to do has already spent the window it was protecting.

A gate that cannot decide is not a gate that failed. It hands the case up, and the tier above runs exactly as it did before the gate existed — which is also what an unconfigured checkout gets, so nothing downstream may depend on a gate having answered.
