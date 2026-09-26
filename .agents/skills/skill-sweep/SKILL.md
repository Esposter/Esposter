---
name: skill-sweep
description: Apply when asked to re-sweep, re-read or clean up every repo skill, the `/skill-sweep` command, or when `pnpm ai:sweep:ledger-coverage` shows open `docs/skills` rows. The whole-tree convergence run over .agents/skills — the setup, the mechanical checks, one skill at a time read whole and fixed in its own commit, the finish, and the report — repeated until a full pass finds nothing; each step names the skill that owns its rule and restates none of them.
---

# Skill Sweep — Every Skill, Until A Pass Finds Nothing

The runnable form of the skill pass over the whole tree. What one skill's pass does is the `skill-authoring` skill's (`references/skill-pass.md`), and every rule a pass checks is that skill's too; this page is the order the whole run takes and what it reports. Rerun it whenever the rules change, a newer model arrives, or the ledger shows open rows — a run that finds nothing is the result it exists to reach.

## Settled — do not re-propose

- **Fanning the skills out to subagents.** A reading pass is priced by files read, and a finding one skill teaches applies to the next; the run stays in the main session, one skill at a time (the `model-delegation` skill, `references/reading-passes.md`).
- **Reading by grep or by skimming.** The findings that matter — a claim the code no longer bears out, a copy between pages — live in prose a grep does not reach; every `SKILL.md` and every `references/` page is read whole.
- **An installed third-party skill in the run.** A skill `skills-lock.json` installs is upstream's, outside the `docs/skills` ledger, and edited by nobody here.
- **Fixing the same kind of finding by hand twice.** The second one is an enforcer (the `sweeps` skill, `references/handing-to-an-enforcer.md`).

## The run

1. **Setup.** `git pull --rebase` over a clean tree, then `pnpm ai:sweep:ledger-coverage` to date the rows from the trailers (the `sweeps` skill, `references/ledger-files.md`).
2. **Mechanical checks first**, and fix what they report before reading prose: `pnpm ai:sweep:skill-docs`, `pnpm ai:sweep:duplicate-prose`, and from `scripts/` `pnpm test src/workspace --run` — citations, ledger units, package scripts. A timeout on a cold cache reruns the one file alone before it is read as a failure.
3. **Per skill, in the main session**, each through the `skill-authoring` skill's pass (`references/skill-pass.md`):
   - read `SKILL.md` and every `references/` page whole;
   - check it against the audit below;
   - verify every code claim against the tree — identifiers, paths, signatures and example code as they exist now, written in the newest APIs and the `error-handling` skill's result chains;
   - fix what the audit finds, code included when the claim is right and the code is wrong, in one commit per skill carrying `Ledger: docs/skills | `<skill>``; a clean skill's trailer rides the next commit, never an empty one.
4. **Finish.** `pnpm ai:sweep:ledger-coverage` again and commit the ledger dates; run the `finishing` skill; then the checks in the background per the `running-checks` skill, with repairs committed behind the units; commit by pathspec, `git pull --rebase` over a clean tree and a plain push (the `review-queue` skill).
5. **Report** a table of every skill — clean or fixed, with one line on what changed — and whether the run reached zero findings. A run that did not ends with the prompt for the next: this skill, rerun.

## The audit

| A skill may owe                                                                         | Owner                                                   |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **One topic per page**, and a mixed page split                                          | `skill-authoring` (`references/splitting-a-skill.md`)   |
| **`SKILL.md` as one-line rules plus an index whose lines name the trigger**             | `skill-authoring` (`references/splitting-a-skill.md`)   |
| **A page opening `Read when …`**                                                        | `skill-authoring` (`references/splitting-a-skill.md`)   |
| **A description opening `Apply when …`, naming the domain and never indexing the body** | `skill-authoring` (`references/frontmatter.md`)         |
| **Citations as backticked repo paths, another skill by name plus page**                 | `skill-authoring` (`references/citations.md`)           |
| **No positional pointer that does not name its target**                                 | `skill-authoring` (`references/skill-pass.md`)          |
| **Magnitudes, never counts; no roster or hand copy of a derived fact**                  | `skill-authoring` (`references/derived-surfaces.md`)    |
| **No restatement of a rule an enforcer owns**                                           | `skill-authoring` (`references/enforced-rules.md`)      |
| **No one-off and no history**                                                           | `skill-authoring` (`references/what-belongs.md`)        |
| **A Settled list first**                                                                | `skill-authoring` (`references/settled-lists.md`)       |
| **An exception naming the forcing agent outside our control**                           | `skill-authoring` (`references/exceptions.md`)          |
| **One owner per rule across skills**                                                    | `skill-authoring` (`references/one-owner-per-topic.md`) |

Every row is answered per skill, and "nothing owed" is an answer.

## After a clean run

The ledger resweep is next: `pnpm ai:sweep:ledger-coverage` lists each ledger's open rows and the entries it could not match, and the unmatched entries are cleaned up first (the `sweeps` skill).
