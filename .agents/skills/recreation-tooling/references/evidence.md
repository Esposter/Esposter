# Evidence

Read when writing a value a recreation ships, recording what a source holds, concluding that something is not in it, or reusing an output a tool wrote in an earlier session.

A recreation is a chain of claims about its source: what a value is, where a part stands, that a mesh does not exist. Each later step builds on the claims before it, so a claim stated with more certainty than its evidence carries is paid for in every step after it.

## A value names how it is known

Every value a recreation ships is one of three kinds, and its comment or its record says which:

- **Read**: the source's own value, with where it was read from (a table and its key, an asset and its field).
- **Solved**: computed from a reference, with the residual the solve printed.
- **Provisional**: no source holds it yet. It names the query or the recording that will replace it, and it sits on the list where that replacement is owed (Genshin's roadmap lists the References sought).

A report never presents a solved value as read, or a provisional one as either. Moving a value between kinds is a change of its own.

## A negative names its boundary

A search that finds nothing reports what it covered, never an absence: "not in the community path index for 2.6", "no mesh named in this extraction". The item it leaves open records that boundary, so the tool that widens the coverage reopens it. Absence is concluded only over a complete inventory of the source. Genshin's capitals once dropped their landmarks as naming no mesh. A day later the game's LOD table and each mesh's dependants named those buildings, after a dozen commits had been spent on the drop.

## A fact is found once

A fact a session establishes about the source is written down in the chunk that found it, on the domain's data-formats page (Genshin's is `openspec/specs/genshin/game-data-formats/design.md`), with the command that shows it. That covers a format's field, an offset, which table holds a value, or the key that joins two tables. A later session cites the row rather than re-deriving the fact. A fact found by a probe is the probe's reason to be promoted to a tool (the rule in `SKILL.md`).

## An output names the code that wrote it

An extraction, a fit or a derivation writes the commit it ran at beside its result. Its readers print the commits to the producing code since then, so a fixed decoder flags every output it left stale. Nobody has to keep a hand list of re-runs or compare file times. An output written from a working tree that held uncommitted changes to its producer says so too, since no commit describes it.

## A tool's test has an oracle of its own

The expected value in a tool's test comes from the source or from a case worked by hand, never from the tool's own earlier output. A golden copied from the tool pins whatever bug it had on the day it was copied.
