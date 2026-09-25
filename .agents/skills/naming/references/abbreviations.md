# Spelling a word out in full

Read when a name could be shortened, when a compound contains a word the denylist does not catch, or when a
short form is about to cross into an exported name, a component or a file name. That there are no abbreviations
is `SKILL.md`'s; this page is where the rule stops and the four cases it is misread on.

## Where the enforcer stops

Only the four short forms with no site left — `acc`, `curr`, `dir`, `idx` — are in oxlint's `id-denylist`, and a
name still in use is not added to it, since the ban would buy disables instead of coverage. The denylist also
catches only the **bare** word, so every compound spelling is the reviewer's.

## `Directory`, never `Dir`

`upperDirectory`, `lowerDirectories`, `DirectorySource`, in a compound as much as bare. A lowercase library word
keeps its own spelling (`mkdir`, `tmpdir`, `readdir`, `gitdir`, overlayfs's `upperdir`), and so does a string
value — `SourceType.Directory` is still `"dir"` on the wire.

## A stored count is `<singular noun>Count`

`commentCount`, `likeCount`, `webhookCount`, DB columns included. Singular, because the suffix already carries the
plurality. It names a **field**; `read*Count` names the fetch that answers with a count and `count*` the in-memory
tally, which are calls.

## Exported names spell the full English word

`statistics` not `stat`/`stats` (`ColumnStatistics`, `ColumnStatisticsDefinitionMap`, `useColumnStatistics`, never
the `Stat`-shortened spelling of any of them), `summation` not `sum` as a statistics identifier (the
`ColumnStatisticsKey` is `summation`). It does **not** reach a math accumulator local (`s`; `acc` is denylisted, so
the accumulator is `accumulator`) or a display title such as `"Sum"`.

## Component and file names are identifiers the whole app types

`Navigation` never `Nav` — `DocsNavigation`, `ResourceBladeNavigation`, `app/models/docs/DocsNavigationSlug.ts`.
