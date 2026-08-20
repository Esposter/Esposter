# Skills

`.agents/skills` read against `skill-authoring` and the ownership map in `.agents/skills/README.md`. Grouped so each row is one review-sized commit, and so the one-owner-per-topic check happens inside a row rather than across commits.

| Unit                                                                                                                   | Swept      | Notes                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `coderabbit`                                                                                                           | 2026-08-11 | 234 lines → 130. Config editing, window composition and the open-thread count moved to `references/`; the login-differs-by-API rule was stated twice and now lives once, on the calls page; the `git` skill's three-gates citation corrected to four                |
| `vue`, `vue-component-patterns`, `vue-page-composition`, `vue-composable-patterns`                                     | 2026-08-11 | `vue` 18 KB → 16; the branching ladder it restated is `typescript`'s and the callback rule went there; auth session became a deep dive and `pinia`'s citation follows it. Two trailing sections that only redirected to a sibling skill are gone                    |
| `styling`, `vuetify`, `unocss`, `responsive`                                                                           | 2026-08-11 | `vuetify` 164 lines → 142, `styling` 18 KB → 16. The border reset and the `mergeProps` stacks each became a deep dive; the `lang="scss"` rule was in three skills and is now in `styling` alone; `unocss` had a `pnpm exec vitest` invocation                       |
| `file-organization`, `formatting`, `error-handling`, `string-utils`                                                    | 2026-08-11 | `file-organization` 19.5 KB → 17: command classes and the localStorage registry became deep dives, and a factory rule carried the four parameter names of the one change that prompted it. `formatting` stated "avoid unnecessary comments" twice                   |
| `typescript`, `zod`, `naming`                                                                                          | 2026-08-11 | `typescript` 18 KB → 17 (106 lines): the `void asyncFn()` ladder is a procedure and became a deep dive; incident counts and library names dropped from the rules that carried them. `naming`'s citation of the moved localStorage section repointed                 |
| `testing`, `bench`                                                                                                     | 2026-08-11 | `bench` 15 KB → 5, `testing` 18.5 KB → 15.7. Two thirds of `bench` was reporter/runner/CodSpeed internals a benchmark author never reads; fake timers and hand-resolved promises left `testing` for a page of their own. `build`'s citation follows                 |
| `pinia`, `pagination`, `routing`                                                                                       | 2026-08-11 | `pinia` 17 KB → 16: the optimistic-snapshot and rollback-scope traps moved onto the mutation-actions page they belong to. `pagination` and `routing` were already one line per rule and under budget — read in full, nothing cut                                    |
| `trpc`, `drizzle`, `azure-table`, `esbabbler`, `esbabbler-call`                                                        | 2026-08-11 | Azure Table clause typing was owned by `trpc` and pointed at from `azure-table`; it now lives with the rest of Azure Table. An entity example there used `!` on a class field, which `typescript` bans in favour of `declare`. The other three: nothing             |
| `skill-authoring`, `README.md`, `docs`, `readme-standards`, `code-review`, `sweeps`                                    | 2026-08-11 | `README.md` restated four `skill-authoring` rules under Principles after declaring itself the index only. `readme-standards` carried a fourteen-row table of every package's npm name, private flag and README path — the thing `docs` bans outright                |
| `build`, `dependency-updates`, `pulumi-infra`                                                                          | 2026-08-11 | The tsgo `ignorePatterns` exclusion and its CI symptom were written up in `dependency-updates`; they belong to `oxlint`, which owns that file. The peer-dependency rule was stated in two skills — `build` keeps it, the other points. `pulumi-infra`: nothing      |
| `oxlint`, `package-scripts`, `context-efficiency`, `model-delegation`, `claude-permissions`, `run-app`, `score`, `git` | 2026-08-11 | `context-efficiency` prescribed a shell poll loop against a ban `testing` calls repo-wide — now scoped explicitly on both counts. `model-delegation` restated the PR file budget as a different number from `coderabbit`'s, and cited a heading that does not exist |
| `slash-commands`, `vjsf`, `tiptap`, `grapesjs`, `vue-phaserjs`                                                         | 2026-08-11 | `vue-phaserjs` listed all thirty components — an `ls` of one directory, carrying a "v1 complete" status marker. What the tree cannot say stays: the lowercase-`s` `<Nineslice>` trap and the deliberately-absent list with its reasons                              |

Over budget at the sweep's start (`skill-authoring`: ~15 KB, ~150 lines per `SKILL.md`) — `coderabbit` 28 KB/234, `file-organization` 19 KB, `testing` 19 KB, `styling` 18 KB, `typescript` 18 KB, `vue` 18 KB, `pinia` 17 KB, `vuetify` 17 KB/164, `bench` 15 KB. Under-budget skills are still in scope: a line that restates an enforcer or narrates one change is dead weight at any size.

The structural half **is** mechanical, and running it first means the reading pass never spends attention on it.
From the repository root; a clean run prints nothing but the budget list. `glob` returns platform separators, so
paths are normalised before the skill name is taken out of them — without that every citation reads as broken:

```bash
python3 - <<'PY'
import glob, io, os, re

norm = lambda path: path.replace("\\", "/")
skills = [norm(f) for f in glob.glob(".agents/skills/*/SKILL.md")]
pages = [norm(f) for f in glob.glob(".agents/skills/*/references/*.md")]

for f in skills:
    text = io.open(f, encoding="utf-8").read()
    lines = len(text.split("\n"))
    if len(text) > 15000 or lines > 150:
        print(f"budget      {f}: {len(text)} bytes, {lines} lines")

for f in pages:
    owner = f.rsplit("/references/", 1)[0] + "/SKILL.md"
    if f"references/{os.path.basename(f)}" not in io.open(owner, encoding="utf-8").read():
        print(f"unindexed   {f}")

for f in skills + pages:
    skill = f.split("/")[2]
    text = io.open(f, encoding="utf-8").read()
    for target in sorted(set(re.findall(r"`references/([\w.-]+\.md)`", text))):
        if not os.path.exists(f".agents/skills/{skill}/references/{target}"):
            print(f"unresolved  {f} -> {target}")
PY
```

Most `unresolved` hits are correct as written: a cross-skill citation names the other skill in the same sentence
(the `trpc` skill's `references/read-endpoints.md`), and `skill-authoring` uses `references/x.md` as a
placeholder — read the line before acting. A citation from **inside** `references/` to a file at the skill root
is the one that is always wrong: it needs `../`, and nothing else resolves it.

The rest of the recipe is reading, not grepping — those failures are prose-shaped. What each pass looks for, in `skill-authoring`'s terms: a rule an enforcer already fails the build on, a one-off written as a standing rule, identifiers or numbers lifted from the change that prompted the note, a pointer to a section the reader reaches by reading on, a paragraph re-arguing a rule already stated, a `references/` page nothing indexes by trigger, a topic owned by two skills.

Two checks bracket every pass. Before: the row's skills are read together, so a rule moving to its most specific owner lands in the same commit. After: each edited skill's `description` is re-read against its new body, and any heading cited elsewhere is grepped for — `grep -rn "<heading text>" .agents/skills packages/app/content/docs AGENTS.md` — because nothing resolves a skill link.

Rules may be rewritten, merged, split across the two tiers, or deleted where they no longer hold. A deletion states its reason in the commit message; the ledger tracks coverage.
