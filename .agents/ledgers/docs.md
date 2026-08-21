# Docs

`packages/app/content/docs` plus the hand-written markdown at the repo root, in each package, and in `.agents/` —
read against the `docs` skill, `readme-standards` for the READMEs, `skill-authoring` for `.agents/skills`. The
diagram-mandate verdict is recorded per page inside the row's pass, never per area. The skill tree is one
subject and has one ledger: its rows are here, and reading a skill for duplication and for prose that does not
earn its line is the same read against the same owner.

**A diagram carries a mechanism** — `docs`, `references/diagrams.md` — joined this ledger on 2026-08-21, so it
asks a second question of every page that has a diagram, beside the mandate's question of every page that has
none. Its rows reset, but only the rows whose units hold diagrams: a resumed pass re-reads the ` ```mermaid `
blocks under its unit, not its prose. The three skill-tree rows do not reset — `skill-authoring` already forbids
a diagram of a rule list, which is the same rule stated narrower, and the whole tree holds three diagrams.

| Unit                                                           | Swept      | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| -------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `architecture/*.md`                                            | 2026-08-21 | diagram pass — `platform` was `ResourceDefinitionMap` drawn as a graph beside the capability matrix that already holds it, and `server-testing` was five mock rosters with no order between them; both now carry only what a reader gets from the shape. Two roster labels and a three-line sentence-in-a-box trimmed, and `content-token-rewriting` lost its diagram outright — it restated its own lead sentence in the same order, and the claim it was making (one pass, not a loop) was the one thing the boxes did not show. Earlier prose pass: every history-shaped grep hit is a present-tense domain use (`no longer available`, `no longer joinable`), and the counts, MDC and fence greps are clean |
| `platform/*.md`                                                | 2026-08-21 | diagram pass — `resource-explorer` carried the per-type blade table inside one node label, three screens above the table itself; the service menu's roster stayed, because the fan-in under it (every source route rendering one list surface) is the page's whole claim. Five labels holding a clause of prose or a row's columns cut back to a name. Earlier prose pass: the shipped log had drifted into paragraphs restating the feature pages listed above it on the same index — one line per program of work now, keeping the fact no page holds (the whole program added no Azure service). The heading is `Shipped log` on all eight areas, and `docs` says what belongs in one                        |
| `esbabbler/*.md`, `esbabbler/calls/`                           | 2026-08-21 | diagram pass over 39 — the area's diagrams are gates and fan-outs already, and the only finding was the invite gate holding its whole SQL predicate as a four-line label. The condition moved into the Join bullet, where it was missing anyway. Earlier prose pass: tombstones inverted (the two emoji libraries, the Storage Queue, `v-intersect`, the PiP activation bug); restating Notes bullets cut from four pages; presence gained the diagram it owed; the call maps' undecided reconciliation moved to a deferred page                                                                                                                                                                                |
| `virrun/*.md`                                                  | 2026-08-21 | diagram pass — the area held the repo's worst labels, most of them a paragraph of the page's own prose inside a box. `correctness` lost its diagram outright: five numbered boxes whose text was the numbered list directly below them, and one edge in the whole picture; the grouping it alone carried (which layers hard-fail CI) is now a sentence. Earlier prose pass: the win32 mirror's whole "why it exists" was a log of our own fixes — rewritten as the rule it leaves (the 9p bridge is crossed a bounded number of times per run, never once per file); the worktree-ghost story told on four pages now told once, on the rule's own page; bench figures dropped for the artifacts that hold them  |
| `sheet-editor/`, `infra/`                                      |            | two pages renamed onto what they describe rather than the migration that produced them; the dead-letter page's operator remediation was cross-referenced twice and stated nowhere, so it is now written; bare /docs routes given prose link text                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `clicker/`, `dungeons/`, `posts/`                              |            | split from `users/` to fit a review window. Two pages owed a diagram and had none — likes (three procedures, one transaction, an optimistic store) and dungeons saves (two load paths, a manual save, the achievement trigger)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `users/`                                                       |            | a roadmap logging what shipped instead of holding open work, and three notes recording that a change needed no migration — the standing fact each was carrying is now stated on its own                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `vue-phaserjs/`, `achievements/`, `fluid-simulator/`, `anime/` |            | the two exhaustive component inventories on the vue-phaserjs index replaced by the command that answers them; a shipped-changelog section cut. The pass found the escaped-line-break defect and it is now enforced, so grep 8 is retired                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| every `deferred/` and `rejected/` page, every `roadmap.md`     | 2026-08-20 | diagram-exempt — read for revisit triggers and re-argued decisions, and both held. Three roadmaps were logging what shipped under a "no open work" line, which is the one thing a roadmap must not do                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `proposals/`, `docs/index.md`, every area `index.md`           |            | the drift this row was opened for did not exist — all 40 index pages list every page beside them, and `content/docs/index.test.ts` now holds that, so the concern is enforced rather than re-read                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| root — `AGENTS.md`, `README.md`, `SCORE.md`, `CONTRIBUTING.md` | 2026-08-20 | plus `SECURITY.md`, `CODE_OF_CONDUCT.md`, `.agents/*.md`. CONTRIBUTING was telling contributors a wrong node version, a wrong lint scope and a `db:up` that applies nothing; the package inventory it half-copied now links the one in the README, and `readme-standards` says why two lists exist                                                                                                                                                                                                                                                                                                                                                                                                              |
| `packages/*/README.md`                                         | 2026-08-20 | `readme-standards` owns the shape, and every one of them held it — what had drifted is the content a reader would act on: two stale node/pnpm versions, a peer that is not a peer, an eslintrc example for a flat-config repo, a CLI subcommand that does not exist and eleven camelCase function names                                                                                                                                                                                                                                                                                                                                                                                                         |
| `.agents/skills/*/SKILL.md`                                    | 2026-08-20 | one citation form settled and swept — a docs page is cited by its repo-relative path, not a relative link, a GitHub url or a /docs route; five one-off war stories rewritten as their rule; the wrong `.agents/skills` symlink claim corrected to `.claude` → `.agents`. The citation rule now lives in `skill-authoring`                                                                                                                                                                                                                                                                                                                                                                                       |
| `.agents/skills/*/SKILL.md` over the ~15 KB budget             | 2026-08-20 | all nine split into `references/`, and the pass found what the budget was measuring: a section over the line is usually another skill's subject (typescript's throwing rules moved to `error-handling`), not a page this skill needed. The trigger-opening rule for a reference page, and the pointer forms a split silently breaks, now live in `skill-authoring`                                                                                                                                                                                                                                                                                                                                              |
| `.agents/skills/*/references/*.md`                             | 2026-08-20 | every page is still indexed by its SKILL.md, and every repo path cited in one resolves. The citation rule settled last window had only reached the SKILL.md files — five pages still cited a docs page by its /docs route, which resolves nowhere from a skill                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

Greps, over `*.md`. Each finds a candidate, not a defect — the failures are prose-shaped and the pass is reading.
What each pattern means is the owning skill's to say:

1. `\b\d+ (files|packages|pages|components|stores|routers|tests|rows|procedures)\b`
2. `(used to|previously|no longer|formerly|was replaced|has been replaced|we now|renamed from|the old )`
3. `(deprecated|moved to|see instead|superseded by)`
4. `\]\([^)]*\.md[)#]`, and `\[/docs/[^]]*\]\(` for link text repeating its own route
5. `^::`
6. ` ```(typescript|javascript|shell|yml)`
7. `mermaid` absent from a page whose prose names three parts and what passes between them
8. a `## Notes` bullet whose claim already appears in a section above it
9. a page that **has** a diagram — the inverse of 7, read against `docs`, `references/diagrams.md`. Two of its
   three failures are mechanical and worth grepping first: a quoted label over 90 characters, and a label
   carrying three or more `<br/>`. Both are a catalog entry or a paragraph that ended up inside a box. The third
   — a diagram that is an inventory or a straight line — is read, since neither has a shape a pattern can see

The skill tree adds a structural check the greps cannot make — a skill over budget, a reference page nothing
indexes, a `references/` citation resolving nowhere. Run it from the repository root; a clean run prints nothing:

```bash
python - <<'PY'
import glob, io, os, re

norm = lambda path: path.replace("\\", "/")
skills = [norm(f) for f in glob.glob(".agents/skills/*/SKILL.md")]
pages = [norm(f) for f in glob.glob(".agents/skills/*/references/*.md")]
names = {f.split("/")[2] for f in skills}

for f in skills:
    text = io.open(f, encoding="utf-8").read()
    lines = len(text.splitlines())
    # Bytes, not code points: this repo's prose is full of em-dashes, and each is three of them
    size = len(text.encode("utf-8"))
    if size > 15000 or lines > 150:
        print(f"budget      {f}: {size} bytes, {lines} lines")

for f in pages:
    owner = f.rsplit("/references/", 1)[0] + "/SKILL.md"
    if f"references/{os.path.basename(f)}" not in io.open(owner, encoding="utf-8").read():
        print(f"unindexed   {f}")

# `docs` and `readme-standards` teach the route and url forms, so they are the two that may write one
for f in skills + pages:
    skill = f.split("/")[2]
    if skill in {"docs", "readme-standards"}:
        continue
    for index, line in enumerate(io.open(f, encoding="utf-8"), start=1):
        if re.search(r"`/docs/", line):
            print(f"docs route  {f}:{index}")

for f in skills + pages:
    skill = f.split("/")[2]
    for line in io.open(f, encoding="utf-8"):
        # A line naming another skill is citing that skill's page, and resolving it here would be wrong — without
        # This every cross-skill pointer reports, and a check that always reports gates nothing
        cited = re.findall(r"`([\w-]+)`", line) + re.findall(r"\*\*([\w-]+)\*\*", line)
        if {name for name in cited if name in names} - {skill}:
            continue
        for target in sorted(set(re.findall(r"`references/([\w.-]+\.md)`", line))):
            if not os.path.exists(f".agents/skills/{skill}/references/{target}"):
                print(f"unresolved  {f} -> {target}")
PY
```

An `unresolved` hit is a pointer nothing resolves, and nothing fails a build on one. A citation from inside
`references/` to a file at its own skill's root is the recurring shape, and it needs `../`. The one line the
check cannot judge is `skill-authoring`'s `references/x.md` placeholder.

Excluded: `CHANGELOG.md` (lerna output) · `CLAUDE.md`, `GEMINI.md` (symlinks to `AGENTS.md`) · `public/docs/api` (TypeDoc
output) · `~/.claude/plugins` skills (external, not ours to edit).

The label caps in grep 9 become checks in `content/docs/index.test.ts` once the last diagram row is swept —
they cannot land before that, for the same reason the link-text half of 4 cannot: an unswept area still holds
instances that would fail the build. Measured when the rule joined, the tree held a couple of dozen labels over
90 characters and a handful carrying three or more `<br/>`, none of them in `architecture/` any more.

Enforceable next. What is already enforced sits with what it guards: the link, index-coverage,
Key Files and both label-line-break checks in `content/docs/index.test.ts`, the sidebar map beside itself in
`DocsSectionGroupsMap.test.ts`, the docs path segment beside the collection that reads it in
`content.config.test.ts`, and prose restating a node or pnpm version in
`content/getToolchainVersionRestatements.test.ts`. Greps 4, 5 and 6 are exact and decide themselves — but the link-text half of 4 can only land
once every row is swept, since an unswept area still holds instances that would fail the build. Grep 1 needs an
allowlist for the counts that may be exact (package count, configured limits) first. The label-line-break checks
reach the skill tree too, since the diagram list it runs over already spans both; the rest do not, and
`content/docs/index.test.ts` reads nothing else under `.agents/`.
