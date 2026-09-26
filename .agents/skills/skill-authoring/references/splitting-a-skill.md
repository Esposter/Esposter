# Splitting a Skill

Read when a page holds a second topic and a section is moving out, or when creating a `references/` page. The
two-tier layout and the index-line rule are in `SKILL.md`; this page is what moves, what stays, and the mechanics of
the move.

## Split by topic, never by size

**A page holds one topic, and a topic with a narrower trigger than the page's is its own page** — found the moment
it is recognised, not when a number says so. Small pages are the goal rather than a cost: a reference page of a few
hundred bytes that is the only statement of its topic beats a section inside a longer page, because a reader who
needs it loads it alone and a writer who changes it edits one place. Two rules that have to be read together to be
followed are one topic and stay on one page; that is the only thing that holds a split back.

## The two tiers

A selected skill loads **whole**, so every byte of `SKILL.md` is paid for by every task that trips its trigger —
including the tasks that needed one rule from it. So:

- **`SKILL.md`** — the rules that apply to _every_ task in the domain, **one line each**, plus an index of the
  reference pages. A rule a reader breaks by default stays here, because a rule that fires only when someone
  thought to look it up does not fire; the line states the rule and names the page that holds its why.
- **`references/<topic>.md`** — one topic that fires only for a _named sub-task_: a **procedure** (ordered steps run
  occasionally), a rule set for one file type, component, tool or sub-task, a worked example, an edge case, or the
  full argument behind an always-on line. It is read when the index line matches, and it is the only place its
  topic is stated.
- **Another skill** — a section that turns out to be another skill's subject moves to that skill rather than becoming
  a reference page here: one owner beats two shallow copies, and the split is the moment that shows up.

**`references/` is the only second tier, and it does not nest**: `ai:sweep:skill-docs` globs `*/SKILL.md` and
`*/references/*.md` and nothing else, so a page parked at a skill's root or in a folder of its own is one the
index-coverage and citation checks never see.

**The index line carries the split**, and it works like frontmatter: name the trigger, not the topic — as the `testing`
skill indexes its fake-timers page _when a test installs fake timers or holds a call in
flight_. An index line that reads "see X for more detail" guarantees the page is never opened.

## The ceiling is a backstop

The ceiling is one byte count — `MAX_SKILL_BYTES` in `scripts/src/services/sweeps/skillDocs/constants.ts` — over
`SKILL.md` alone. Bytes are what an always-on page costs a context window (an em-dash is three of them). A skill it
names has a missed split; the fix is separating topics, never shaving prose, and the space below it is never room a
skill is entitled to. The check reads `SKILL.md` alone, by design: a reference page's bytes are paid only when its
index line matches, so its size is not the always-on cost the ceiling measures. Every other check the sweep runs is a
test, `scripts/src/workspace/skillDocs.test.ts`.

## A reference page opens by naming its trigger

**Its first paragraph begins with the word `Read`** — `Read when a test needs a DOM`, `` Read before writing any
`watch` ``. A reader landing on the page from a search rather than from `SKILL.md` has nothing else to tell them
whether the page is theirs, and the fixed opening is what lets `ai:sweep:skill-docs` decide it (`triggerless`)
instead of judging a paraphrase (`references/enforceable-shapes.md`).

**Where `SKILL.md` kept part of the rule, a second line says which part**: "the rule itself is in `SKILL.md`;
this page is Y". Without it the reader cannot tell whether they are holding the whole rule or its tail, and the
always-on half gets restated here the next time someone edits the page. A page that holds its whole subject
needs only the trigger, and adding the second line there invents a split that does not exist.

## A split breaks inbound pointers, so fix them in the same change

Other skills cite sections by heading (``see the `pinia` skill ("Cursor Pagination in Stores")``), and a heading
that moved into `references/` leaves that citation pointing at nothing — silently, because nothing resolves
skill links. After moving a section, grep the tree for its heading text and repoint each citation at the page
(``see the `pinia` skill (`references/keyed-state-and-pagination.md`)``), which is stable across later edits to
the heading itself.

One pointer form breaks **inside** the moved text as well: a cross-page "see below"/"as above" no longer has its
target, and it resolves to nothing without failing a build. A `references/<page>.md` citation is not that — the path
is relative to the **skill**, not to the file holding it, so it reads the same from `SKILL.md` and from a sibling
page and survives the move untouched. Shortening one to bare `<page>.md` because the pages now sit together is the
edit to resist: it drops the context that says which tree the page is in, and it is only correct until the text
moves again.
