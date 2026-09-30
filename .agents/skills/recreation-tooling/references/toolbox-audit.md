# Auditing the toolbox

Read when starting a new kind of recreation, or when a loop has stalled: how its unknowns are listed and held against the tools that answer them.

## The unknowns table

Write one row per unknown before building, on the domain's toolbox page:

- **The unknown**, named as a question the recreation must answer: where a part stands, how far the camera is, what colour the light is, what curve the grade applies.
- **Its kind.** _Exact_: the source holds it as a value, a mesh, a texture, a transform or a curve. _Fieldless_: the source holds it, but without the fields that name it (a script's serialized bytes, an emitter's settings). _On screen only_: nothing but the reference shows it.
- **The query that answers it**: a reader for exact data, a scanner for fieldless bytes, a solve or a fit for what is on screen.
- **What makes it separable**: the mask, the held values or the invariant under which only this unknown moves the number.
- **The tool, or the gap.** A row with no tool is the next thing built.

An unknown split across kinds (a light whose colour is in a script's bytes but whose strength shows only on screen) is two rows.

## Running the audit

1. **Read what exists.** Every command of the domain's tooling, each by its own `--help`, and the domain's toolbox page; never a memory of what the tools did last time.
2. **Fill the table from the stalled problem.** A stalled pass names its unknown by what kept moving: a pose that kept shifting while the arrangement never was checked is two unknowns tangled, and each gets its row.
3. **Mark every gap.** A row whose answer is a search, a hand measurement repeated across sessions, the user's eye, or a guess, is a gap.
4. **Build the gap nearest the root first.** Unknowns form a chain (what the scene holds, then where it stands, then the camera that sees it, then the light on it, then the grade over it), and a later unknown's solve absorbs an earlier one's error, so the earliest gap is closed before any later row is trusted.
5. **Write the tool back into the table** in the commit that ships it, and delete what it supersedes.

## Where a tool lives

A tool is a command of the domain's tooling with its own test, never a scratch script: a scratch solve is lost with its session, and the unknown returns with the next scene. What it reads and writes follows the domain's rules for its sources (the `genshin-parity` skill's for the game's files).
