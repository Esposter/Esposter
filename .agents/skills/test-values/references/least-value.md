# The Least Value That Still Distinguishes

Read when a case needs two values to differ, or a value seems to need more than its kind's canonical form. The one-line rule is in `SKILL.md`; this page is its argument and how a pair is moved apart.

Every value a test writes is the least one that tells apart what the test reads, and nothing more. That is the
whole reason `""` comes before `" "`, `0` before `1`, the epoch before any other instant, and `"a"` before a
word: the least value carries no part the reader has to explain, so whatever is _not_ least is exactly the part
under test. When a case needs two values to differ — a sort, a reformat, a day against a month — one of them
moves, by one step, in the one part the case reads (`""` against `" "`, the epoch against its next day, month
`13` on the first day rather than a thirteenth month on some other day). Anything further from the least than
the case needs reads as data someone chose, and the reader stops to ask why. Collapsing such a pair onto one
literal deletes the assertion rather than shrinking it — an output read off the wrong field still equals the
expectation — so a value whose _source_ is what the case reads keeps a decoy one step away
(`packages/shared-node/src/services/formatBenchmarkMarkdown.test.ts` asserts a group heading of `" "` beside a
`filepath` of `""`). The canonical values (`references/canonical-values.md`) are that rule applied per kind; `references/dates-and-times.md` is it applied
to the one kind with many parts.
