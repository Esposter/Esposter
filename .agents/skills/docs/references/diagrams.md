# Diagrams

Read when adding a diagram to a docs page, judging whether a page owes one, or sweeping an area's diagrams. The
one-line rule — a page describing an interaction between three or more parts carries a Mermaid diagram — is in
`SKILL.md`; this page is which pages owe one, what one may hold, and the two gotchas that parse and still render
wrong.

## Which pages owe one

Any page describing a flow, lifecycle, or interaction between 3+ parts (components, procedures, storage,
background workers) MUST carry a Mermaid diagram — `flowchart` for data/navigation flows, `stateDiagram-v2` for
lifecycles, `sequenceDiagram` for request/event ordering. Prose says _why_; the diagram is the alignment artifact
for _what talks to what_. Label edges with the procedure or event that drives them.

Exemptions: `index.md` pages, `deferred/`/`rejected/` pages, `roadmap.md`, and static inventories (key-file
tables, component lists). Never add a diagram as decoration.

**The exemption is about the page's shape, not its length.** A short page describing one small flow still owes a
diagram; a long page that is a list of rules owes none. When auditing an area, the question to ask each page is
"does the prose name three parts and say what passes between them?" — if it does, a missing diagram is a finding,
however tidy the page reads. Pages that only _feel_ exempt are the ones this survey keeps rediscovering, so
record the verdict per page rather than per area.

## What a diagram may hold

The mandate above says when a page owes one, which leaves the opposite failure uncaught: a page that has a
diagram and is worse for it. A reader gives a picture one look, so what it costs them is not its size but how
much of that look is spent on something the shape was never going to answer.

A diagram shows a **mechanism** — an order, a gate, or a fan-out. Three shapes are not mechanisms, and each has a
better home:

- **A catalog** — nodes that are entities, labelled with their attributes. A registry drawn as a graph is that
  registry's own table with edges added, and the two or three edges that are real flow drown among the ten that
  are only membership. Keep the flow; let a table hold the entries.
- **An inventory** — subgraphs of what wires what, with no order between them. The tell is that reading it in a
  direction answers nothing. The **Key Files** table already lists the parts, and one sentence says what
  assembles them.
- **A single chain with no branch** — a sentence, drawn as boxes. Two exceptions, both genuine mechanisms:
  parallel chains being _compared_ (three transports differing only in their middle step — the shape is the
  comparison), and a chain where **a step's position is the claim**, so moving one box changes the outcome. The
  test for the second is whether a reader's default ordering is the wrong one: rewriting a rendered date
  _before_ hydration rather than after is the whole reason it does not mismatch, while collect-then-resolve-then
  -replace is the only order anyone would have guessed, and the claim there is really "one pass, not a loop" —
  which the boxes do not show.

**A node label is a name, not a sentence.** It may carry one qualifier under a `<br/>` — the procedure that runs
there, the columns a row holds, the condition a gate tests. It may not carry a parenthetical clause of prose. A
label that needs three lines is either a catalog entry or the paragraph the page owes, and both belong outside
the box.

The same question decides all four: **what can a reader answer from this that the prose did not already give
them in less time?** An order, a branch, or a fan-out passes. A list of names does not.

## Two gotchas that parse and still render wrong

Every diagram is parse-validated by `packages/app/content/docs/index.test.ts` (`mermaid.parse` over all
` ```mermaid ` blocks), so a syntax error fails `pnpm test`. These two are the ones the parser accepts:

- `;` is a mermaid statement separator **even inside message and note text** — never use a semicolon in a label
  or a note. Use an em dash or a comma.
- A label is one quoted string on one line, so a break inside it is written `<br/>`. A backslash-n draws those
  two characters into the box, and a real newline is swallowed and renders as one run-on line.

Both are checked too, so they fail `pnpm test` rather than only the rendered page.
