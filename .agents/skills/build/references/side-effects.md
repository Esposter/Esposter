# The `sideEffects` Field

Read when setting or reviewing a package's `sideEffects`, or when a bundle loads without error and does nothing. The rule itself is in `SKILL.md` — every package answers with one of three values; this page is why each answer is what it is and how the wrong one fails.

`sideEffects: false` is right for a library — it is what lets a consumer's bundler drop the parts of it they do
not import. It is fatal for a package whose **entry exists to run**, and the failure is silent in a way worth
recognising: a registration written as a bare call whose result nothing uses, in a module with no named export
for the barrel to keep alive, is a pure side effect by every rule a bundler has. Told the package has none, it
removes them all, keeps the exports, and drops the import of the host library entirely. What ships is a bundle
that loads without error and does nothing — for the Functions app, one that deploys, starts, reports `Running`
and never runs a trigger again.

So such a package sets `sideEffects: true`. Declaring it beats relying on the absence of the field, because the
absence is what a repo-wide sweep adding `false` everywhere overwrites without anyone reading the diff twice.
A package whose side effects each land in an exported binding — the infrastructure program's
`export const x = new Resource(...)` — needs nothing: the export is what keeps it alive.

**Every package answers, and one of three answers.** `false` where nothing runs at import; `true` where the
entry exists to run; an **array of module paths** where one module runs and the rest are ordinary exports — a
package registering a plugin at module scope names that file rather than surrendering the whole package's
tree-shaking to a blanket `true`. Name both arms when a package is resolved through both: a consumer
on `source` reaches the file itself, one on `default` gets a single chunk that carries the registration with
everything else, and a path matching neither leaves a bundler free to drop the call.

Leaving the field off is not the safe middle — absent means _unknown_, so a consumer's bundler keeps everything,
the same outcome as `true` while reading as nobody having considered it. Nothing can derive the value, so
`scripts/src/workspace/sideEffects.test.ts` enforces what is derivable: every package with a tsdown config declares the field,
and only the run-on-import one claims `true` wholesale.

**Assert it in that package's own `src/index.test.ts`.** Count the registrations in the built bundle against the
source files that should have produced them; nothing else can see the difference, because every other test
imports source rather than `dist`, and the bundle still loads either way.
