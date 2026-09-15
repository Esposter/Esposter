# Writing a convention so a check can decide it

Read when writing or revising any convention that a check could one day own — before the prose is written, not
after. Where the check then lives, what it is called and how it is wired is `references/embedded-recipes.md`; when
a rule is owed one at all is the `sweeps` skill (`references/handing-to-an-enforcer.md`). This page is the step in
front of both: the convention's own form.

## Give the rule a shape, not an intent

**A convention stated as an intent can only be judged; one stated as a shape can be decided.** The same rule
written two ways:

- _intent_ — "a reference page opens by telling the reader what it is for"
- _shape_ — "a reference page's first paragraph begins `Read `"

The first cannot be checked, because `Use it for …`, `For tests that …` and `Only with its workflow off …` all
satisfy it and no pattern separates them from a table of contents. The second is a `startsWith`. Nothing is lost:
the page still says what it is for, and now it says it the same way every time, which is also what makes it
skimmable.

The shapes this repo uses, in order of preference:

1. **A fixed heading** — `## Settled — do not re-propose` is the exemplar. Present-or-absent and first-or-not are
   both exact.
2. **A fixed opening or prefix** — a page's `Read …`, a script's `ai:` name, a constant's `_REGEX` suffix.
3. **A registry the code indexes** — `AsyncDataKey`, `LocalStorageKey`, `RoutePath`. The strongest form, because
   typecheck owns it and no sweep is needed at all.

## The test, before the prose

Ask what a checker would have to match. If the answer is "it depends what the author meant", the convention is
still an intent — **pick one of the variants and make it the form**. Doing this later is strictly worse: a check
written against an inconsistent corpus is written weak to avoid false positives, and a weak check is one nobody
can rely on, so the rule goes on being enforced by whoever happens to notice.

**Normalising what already exists is part of adopting the shape**, in the same change. The reference pages once
opened however each author felt like; the check written against that corpus could only ask whether a page had any
opening prose at all, so it missed every page whose opening paragraph said nothing useful. Normalising first made
the same check a `startsWith` that decides every page in the tree.

## What the prose keeps once the check exists

One line: the shape, the non-obvious _why_, and the check's name ("Don't restate what an enforcer already checks").
Not the variants it rejects, not the error text, not a list of the files that comply — a roster is a snapshot the
next file invalidates (`references/what-belongs.md`).

A shape whose check does **not** exist yet still goes in as a shape. It costs the same to write, it reads no worse,
and the day someone writes the check it is a `startsWith` rather than a corpus migration.
