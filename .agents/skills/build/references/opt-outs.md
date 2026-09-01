# Opting out of the default build shape

Read when a package minifies, vendors a dependency the default would externalize, or declares an entry field a runtime host loads by convention. This page holds the whole rule; `SKILL.md` states only the default each of these departs from.

## Minify only the deploy artifact

Only an artifact a host downloads and parses at every cold start is worth compressing. Nothing else minifies: a library's consumer minifies for themselves, and readable output is what a stack trace is read through.

**Compression on, mangling off** — which is why it is spelled out as options rather than `minify: true`. Compression takes roughly a third off. Mangling takes off about that much again and renames every identifier, so the stack for a delivery that already happened names `t` instead of the handler — and for a fire-and-forget event, that stack is the whole diagnosis. `dce-only` is worth nothing (rolldown already tree-shakes), and whitespace removal is `codegen.removeWhitespace`, on by default and never restated. No test covers minified output: tests import source, and only the size snapshot reads `dist`.

## What gets vendored is recorded, not allowlisted

The base sets `deps: { onlyBundle: false }`, which silences tsdown's standing hint that an allowlist of inlinable packages is missing. The list it asks for already exists in a better form: tsdown writes every package it vendored into the manifest's `inlinedDependencies`, and that field is committed, so anything newly inlined turns up in a reviewed diff beside the change that caused it. A second, hand-maintained copy could only ever be bootstrapped by hand-writing the versions tsdown itself generates — the check runs before the manifest is written, so the first build of a new package could never pass. Read `inlinedDependencies` when you want to know what a bundle swallowed.

## The opt-outs

Declared in the package's own `tsdown.config.ts`, never in `configuration`. There is one rule and one exception.

**A self-contained bundle vendors; a library externalizes.** A package whose `dist` is run directly — a CLI installed with one command, a deploy artifact dropped into a host that installs nothing — has no package manager on the other side to resolve an import with, so it bundles what it uses. Derive `alwaysBundle` from the manifest rather than listing names, so a newly added dependency is vendored without anyone remembering to. Three things still stay external:

- **What the host itself provides.** A vendored second copy of the host's own runtime API is not the instance the host hands the handler.
- **Anything resolving a peer through `createRequire` relative to its own installed file.** Vendoring rebases that lookup into the bundle, where the peer is not.
- **A dependency that already resolves on disk wherever the program runs.** A workspace sibling in `dependencies` is one: Node reads its `default` export arm and finds `dist`, so vendoring it buys nothing and multiplies the bundle. Nothing needs an opt-out to get this — it is what externalizing already does.

**A library vendors the one dependency that breaks its consumers.** The exception to the rule above. A CJS package whose entry is a barrel re-exporting its real entry through an extensionless relative `require` cannot be safely externalized: a downstream bundler inlines the barrel and emits that re-export as a specifier Node cannot resolve, so the failure lands in a _consumer_, at its first request, naming a file inside a dependency the consumer never imported. Settle it where the dependency was chosen — `deps.alwaysBundle` with that one name, `dependencies` untouched, because what a bundle swallows is a build decision and `inlinedDependencies` is where the build records it.

Read that record before accepting the trade: vendoring pulls the dependency's own tree in with it, and one such package took `@esposter/db` from tens of KB to over a megabyte. This is a named exception per dependency, never a policy — **do not generalize it to "vendor CJS dependencies"**. Most are externalized perfectly well, and a blanket rule would vendor the same date library into half the dists here.

A package nothing consumes as a library also sets `dts: false`; declarations would only cost build time.

**`@esposter/configuration`** is the exception: `deps: { neverBundle: true }`. It is private, never published, and its dist imports nothing but build tooling every workspace member already has installed.

## The manifest's entry fields are generated — except where a host reads them

tsdown rewrites the entry fields of the package it builds: it writes the `exports` map (and the type entry a
consumer resolves through), so those are never hand-maintained, and a field it does not write is **removed on the
next build**. For a library that is exactly right — `exports` supersedes `main` for every resolver this repo
targets, so a hand-written `main` would be a second source of truth that drifts from the generated map.

**It is wrong for a package a runtime host loads by convention rather than by resolution.** Such a host reads a
fixed field and never consults `exports`: the Azure Functions v4 model loads an app by `main`. Generation
therefore deletes the one field that makes the artifact work, and nothing catches it — no import resolves through
it, a private package gets no publint, and typecheck, lint and every other test pass. What ships is a host that
reports Running with **zero functions registered**, so every trigger stops silently.

So a package like that turns generation off (`exports: false` in its own `tsdown.config.ts`) and declares the
host's field by hand. It loses nothing by doing so: nothing resolves it as a dependency, which is why it had no
use for an exports map in the first place. Pin the field with an assertion in that package's `src/index.test.ts`
— one package, one test, and it is the only enforcer there is. A host that names its entry somewhere else instead
(Pulumi's `Pulumi.yaml` points straight at `dist/index.js`) needs neither the field nor the opt-out.
