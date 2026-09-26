# Scratch Checks

Read when a session writes a throwaway script, grep or probe to check its own work — a duplicate finder, a citation guard, a coverage count — or is about to keep one for next time.

**A check a session had to write is an enforcer the repo is missing.** It exists because nothing in the tree would have failed on what it catches, and a check that lives in a scratchpad dies with the session that wrote it: the next session repeats the mistake with nothing to stop it. So a scratch check that finds something is promoted into the repo in the same change, and the promotion is the moment the enforcer beside it gets simpler rather than a second one appearing next to it.

```mermaid
flowchart TD
  SCRATCH["a scratch check found something"] --> OWNED{"does an enforcer already own this class of mistake?"}
  OWNED -->|"yes"| EXTEND["extend it — widen a pattern, narrow an exemption, add a case"]
  OWNED -->|"no"| DECIDABLE{"can a program decide it?"}
  DECIDABLE -->|"no"| SKILL["a reading rule in the owning skill"]
  DECIDABLE -->|"one file, syntax"| LINT["a lint rule (oxlint skill's decision tree)"]
  DECIDABLE -->|"the whole tree"| TEST["a test under scripts/src/workspace/"]
  DECIDABLE -->|"candidates a person judges"| SWEEP["an ai:sweep: script under scripts/src/sweeps/"]
  EXTEND --> PROVE["plant a violation — the check must fail on it"]
  LINT --> PROVE
  TEST --> PROVE
  SWEEP --> PROVE
  PROVE --> FIX["fix every site it reports, in the same change"]
  FIX --> DELETE["delete the scratch copy"]
```

- **Extend before adding.** Most scratch checks are a case an existing enforcer's exemption or pattern stops short of — the duplicate-prose test exempting every pair inside one skill, the citations test resolving paths but not headings. Widening the existing one keeps one owner per class of mistake; a second enforcer beside it is two definitions of the same failure that drift.
- **Read the enforcer while extending it.** The new case usually makes something in it redundant — a special case the widened pattern now covers, a helper only the old exemption needed — and removing that is part of the promotion, not a follow-up.
- **A test fails; a sweep prints.** A rule that holds everywhere once fixed is a test that fails `pnpm test`. A list of candidates a person has to judge is an `ai:sweep:` script, and it is a test the moment the judgement becomes mechanical.
- **Prove it before trusting it.** A check that cannot fail is not evidence; plant the violation, see the failure, then remove the plant — the same rule a sweep's find recipe follows (the `sweeps` skill, `references/find-recipes.md`).
- **A one-off transformation is not a check.** A script that rewrites files once — a bulk move, a rename — has no lasting question to answer and stays in the scratchpad; what it must not break is what the enforcers above are for.
