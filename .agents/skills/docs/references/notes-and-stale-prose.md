# Notes and Stale Prose

Read when writing a `## Notes` bullet on a page, or when removing a passage that describes something the repo no
longer has. The rule itself is in `SKILL.md` — no deprecated or stale content, and a note earns its place by
saying what no section above does; this page is how to tell a note from a defect and a tombstone from a rule.

## A trailing summary is not a note

A `## Notes` bullet earns its place by stating something no section above does — a consequence, an exception, a
pointer to a decision recorded elsewhere. A bullet that restates the page's own rule in shorter words is the page
disagreeing with itself the moment either copy is edited, so it is deleted rather than kept in sync.

## A note may record an accepted trade; it may never record an unfixed defect

The two read almost identically — both are a sentence about behaviour that is not what you would design — and
only one of them is finished. A trade names what it buys and what it costs ("proportional shares rather than exact
per-building offline math — close enough for a stat display"); a defect names something that is simply wrong and
is waiting for a condition to make it visible ("with today's single-target effects this is invisible, but a
multi-target effect would silently drop later targets"). The second one is a bug report filed where nothing will
ever pick it up: prose is not a queue, a `## Notes` bullet has no owner, and the condition that makes it bite
arrives as ordinary content work by someone who never reads this page.

So a defect is **fixed in the change that noticed it**, or it becomes a roadmap item with a proposal — and the
note goes either way, because a page describing as-built behaviour has nothing to say about a bug that no longer
exists or about one that is now tracked somewhere with a name. The tell is the conditional: a sentence whose cost
is in the future tense is a defect, not a trade.

## Invert a tombstone, don't just delete it

Most stale passages are not dead weight — they are a live rule stated as the history of what it replaced ("X used
to be per-call-site; it is now a flag", "the explorer replaced DocumentPicker", "v1 was mesh WebRTC"). Deleting the
sentence takes the reasoning with it, which is why these survive pass after pass and get re-added. Keep the
reasoning, drop the past tense and the dead identifier: state the rule in the present, with the why the history
was carrying. A "Deleted routes:" list or a bare "Y was removed — do not reintroduce" has no reasoning to save and
is simply deleted.
