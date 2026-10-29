---
name: skill-sweep
description: Apply when asked to re-sweep, re-read or clean up every repo skill, or when `.agents/ledgers/docs/skills.md` has open rows. The whole-tree convergence run over .agents/skills, repeated until a full pass finds nothing.
---

# Skill Sweep — Every Skill, Until A Pass Finds Nothing

The runnable form of the skill pass over the whole tree. What one skill's pass does is the `skill-authoring` skill's (`references/skill-pass.md`), and every rule a pass checks is that skill's too; this page is the order the whole run takes and what it reports. Rerun it whenever the rules change, a newer model arrives, or the ledger shows open rows — a run that finds nothing is the result it exists to reach.

## Settled — do not re-propose

- **Reading the skills with haiku readers, one per batch, in parallel.** Each reader applies the fixes its rule settles and reports every call it could not settle; the main session judges each reported call and diff before its commit. Rejected: the main session reading every skill itself (the `llm-delegation` skill, `references/reading-passes.md`).
- **Reading by grep or by skimming.** The findings that matter — a claim the code no longer bears out, a copy between pages — live in prose a grep does not reach; every `SKILL.md` and every `references/` page is read whole.
- **An installed third-party skill in the run.** A skill `skills-lock.json` installs is upstream's, outside the `docs/skills` ledger, and edited by nobody here. A skill one of our own plugins ships (`packages/*/skills`) is ours and is read with the package that ships it.
- **Fixing the same kind of finding by hand twice.** The second one is an enforcer (the `sweeps` skill, `references/handing-to-an-enforcer.md`).

## The run

1. **Setup.** `pnpm ai:sweep:ledger-coverage` to date the rows from the trailers (the `sweeps` skill, `references/ledger-files.md`).
2. **Mechanical checks first**, and fix what they report before reading prose: `pnpm ai:sweep:skill-docs`, `pnpm ai:sweep:duplicate-prose`, and from `scripts/` `pnpm test src/workspace --run` — citations, ledger units, package scripts. A timeout on a cold cache reruns the one file alone before it is read as a failure.
3. **Per skill, through the `skill-authoring` skill's pass** (`references/skill-pass.md`), a haiku reader per batch of skills running in parallel; concurrent writes are allowed, since readers edit disjoint skill folders and a clash is settled when the run converges:
   - read `SKILL.md` and every `references/` page whole;
   - check it against the audit on this page;
   - verify every code claim against the tree — identifiers, paths, signatures and example code as they exist now, written in the newest APIs and the `error-handling` skill's result chains;
   - apply the fixes the audit settles, code included when the claim is right and the code is wrong, and report every call it did not settle.
   - The main session then reads each skill's diff and report, decides every reported call, and commits the skill's fixes in one commit carrying `Ledger: docs/skills | `<skill>``; a clean skill's trailer rides the next commit, never an empty one. A round that leaves findings runs again until a full pass finds nothing.
4. **Finish.** `pnpm ai:sweep:ledger-coverage` again and commit the ledger dates; run the `finishing` skill; then the touched tests in the background per the `running-checks` skill; commit by pathspec and push the queue (the `review-queue` skill).
5. **Report** a table of every skill — clean or fixed, with one line on what changed — and whether the run reached zero findings. A run that did not ends with the prompt for the next: this skill, rerun.

## The audit

| A skill may owe                                                                         | Owner                                                             |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **One topic per page**, and a mixed page split                                          | the `skill-authoring` skill (`references/splitting-a-skill.md`)   |
| **`SKILL.md` as one-line rules plus an index whose lines name the trigger**             | the `skill-authoring` skill (`references/splitting-a-skill.md`)   |
| **A page opening `Read when …`**                                                        | the `skill-authoring` skill (`references/splitting-a-skill.md`)   |
| **A description opening `Apply when …`, naming the domain and never indexing the body** | the `skill-authoring` skill (`references/frontmatter.md`)         |
| **Citations as backticked repo paths, another skill by name plus page**                 | the `skill-authoring` skill (`references/citations.md`)           |
| **No positional pointer that does not name its target**                                 | the `skill-authoring` skill (`references/skill-pass.md`)          |
| **Magnitudes, never counts; no roster or hand copy of a derived fact**                  | the `skill-authoring` skill (`references/derived-surfaces.md`)    |
| **No restatement of a rule an enforcer owns**                                           | the `skill-authoring` skill (`references/enforced-rules.md`)      |
| **No line that steers nothing, and no route prescribed where a goal would do**          | the `skill-authoring` skill (`references/degrees-of-freedom.md`)  |
| **No one-off and no history**                                                           | the `skill-authoring` skill (`references/what-belongs.md`)        |
| **A Settled list first**                                                                | the `skill-authoring` skill (`references/settled-lists.md`)       |
| **An exception naming the forcing agent outside our control**                           | the `skill-authoring` skill (`references/exceptions.md`)          |
| **One owner per rule across skills**                                                    | the `skill-authoring` skill (`references/one-owner-per-topic.md`) |

Every row is answered per skill, and "nothing owed" is an answer.

## After a clean run

The ledger resweep is next: `pnpm ai:sweep:ledger-coverage` dates each ledger's rows from the commit trailers and prints the entries it could not match. The open rows are the `—` cells in `.agents/ledgers/docs/skills.md`, and the unmatched entries are cleaned up first (the `sweeps` skill, `references/ledger-files.md`).
