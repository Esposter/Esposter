---
name: over-engineering
description: Apply when writing or reviewing any change, when deciding whether a refactor or a simplification is worth making, when a helper, wrapper, flag, map, abstraction or mechanism is about to be added, and when a review's quality lane asks whether a thing earns its existence. Esposter catalogue of over-engineering — what an abstraction must earn, and the shapes a change takes when it builds more than the problem needs.
---

# Over-engineering

The one list of the shapes a change takes when it builds more than the problem needs. Each rule lives in the skill named beside it, stated there in full; this page is the index a review's quality lane walks, so nothing is stated here that another skill owns. The rules with no other owner are marked **owned here**.

## The goal — owned here

**An abstraction earns its place when it lowers the reader's cognitive burden, and for no other reason.** Duplicated business logic, a value reused across sites, a shape several callers have to agree on: naming one of those means a reader learns it once and recognises it everywhere, and a change to it lands in one place. That is the whole of what a refactor or a "simplification" is for, and it is the question every entry below is a failed answer to. Fewer lines is not the goal; fewer things a reader has to hold in their head is — and a name they have to chase is one more, not one fewer. The sharper form, for a helper, is the `file-organization` skill's (`references/extraction-and-duplication.md`): an extraction earns its existence only when a call site stops being able to get something wrong. "Might need it" is never that. A branch collapsed into a default is the same trade in a step's clothing: one step whose default selects everything asks the reader to know the equivalence, where two explicit steps say what each does. Fewer steps bought implicit behaviour; the two stay.

## Write once — the other half of the goal

The opposite failure, building the same mechanism again for every case, is the write-once standard's (`openspec/specs/architecture/write-once/design.md`).

## Syntax is never extracted — owned here

A helper whose body is one expression with no logic, invariant or default only renames a construct, and is inlined; the counter-test is drift — a condition a site could write half of and still compile is a rule, and earns a name (`references/syntax-extraction.md`).

## A hand-rolled copy of tooling a dependency already provides — owned here

A cache, a runner, a dependency order, a concurrency limit or a filter that an installed tool already provides is used as that tool documents it, and a hand-rolled one is deleted. Before designing any of them, the installed tool's own docs are read for the feature.

## The catalogue

| Shape                                                                                               | The owner                                                                                                                                      |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| A wrapper that forwards its arguments and adds nothing                                              | the `file-organization` skill (`references/extraction-and-duplication.md`); `pass-through-helper/no-forwarding-wrapper` lints it               |
| A `Result` around a body that cannot fail                                                           | the `error-handling` skill (`references/wrapping.md`)                                                                                          |
| A flag, field or primitive nothing behaves differently without                                      | the `file-organization` skill (`references/extraction-and-duplication.md`)                                                                     |
| An export, schema, type or constant with no call site                                               | the `typescript` skill ("Never declare what nothing uses")                                                                                     |
| A return type written where inference already answers                                               | the `typescript` skill (`references/function-signatures.md`), the `vue-composable-patterns` skill ("Don't annotate composable return types")   |
| A `use*` that re-exposes a store, a store function that forwards to another                         | the `vue-composable-patterns` skill (`references/earning-a-composable.md`), the `pinia` skill (`references/no-redirects.md`)                   |
| A primitive hand-rolled beside the one that already owns the job                                    | the `vue-composable-patterns` skill ("Reach for the primitive")                                                                                |
| A map or factory generalising over callers that share a name and little else                        | `openspec/specs/resource/resource-snapshots/design.md`                                                                                         |
| A batch procedure for a surface that acts on one item, or a single one kept beside its batch        | the `trpc` skill (`references/procedure-arity.md`)                                                                                             |
| A capability, shared package or mechanism promoted for a single consumer                            | `openspec/specs/architecture/resource/design.md` (the admission rule); the `file-organization` skill (`references/cross-package-placement.md`) |
| A test that pins what typecheck, a Zod constraint or another test already enforces                  | the `testing` skill (`references/what-earns-a-test.md`)                                                                                        |
| A test helper file with one suite importing it                                                      | the `testing` skill (`references/test-helper-files.md`)                                                                                        |
| A benchmark of a wrapper rather than the unit inside it                                             | the `bench` skill (`references/what-to-bench.md`)                                                                                              |
| A durable mechanism — an outbox, a queue, a sweep — for a failure the next write repairs on its own | `openspec/specs/resource/storage-quotas/design.md`                                                                                             |
| A script bent to fit a runner, or a shim built so a runner fits the script                          | the `package-scripts` skill (`references/typescript-scripts.md`)                                                                               |
| A lint rule or test kept for a shape that can no longer be written                                  | the `invariants` skill (`references/retiring-an-enforcer.md`)                                                                                  |

## Reading a finding against this list

- A review finding that names a shape here cites the owning rule, never re-argues it (the `code-review` skill, `references/written-record.md`).
- A shape that recurs without an owner is a missing row **and** a missing rule: add the rule to the most specific skill, then the row here — never the rule here alone, because this page is an index and a rule stated only in an index is one nobody loads for the file at hand.
- The argument that made the shape look necessary — a check nothing reads, a cost nobody measured — is one step earlier and has its own index: the `fallacies` skill.
- The opposite failure has its own owners: a helper that _should_ exist and was hand-rolled twice is the `file-organization` skill's ("Never Duplicate Similar Logic"), and a primitive that exists and was not used is the `vue-composable-patterns` skill's ("Reach for the primitive").

## Reference pages

- `references/syntax-extraction.md` — when a helper would only spell a construct shorter, or repeated expressions might be a rule.
