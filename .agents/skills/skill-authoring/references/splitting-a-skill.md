# Splitting a Skill

Read when a `SKILL.md` has passed its budget and a section is moving out, or when creating a `references/` page.
The two-tier layout, the budget itself and the index-line rule are in `SKILL.md`; this page is the mechanics of
the move.

## What qualifies

Move a section out when it is a **procedure** (ordered steps run occasionally), when it fires only for one
narrow sub-task, or when it runs past ~40 lines of examples. Keep it in `SKILL.md` when violating it is the
**default behaviour** — a rule that fires only if someone thought to look it up does not fire.

Where a section over the line turns out to be another skill's subject, it **moves to that skill** rather than
becoming a reference page here: one owner beats two shallow copies, and the split is the moment that shows up.

## A reference page opens by naming its trigger

Its first line is "read when X" — a reader landing on the page from a search rather than from `SKILL.md` has
nothing else to tell them whether the page is theirs.

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
