---
title: Published package metadata
description: Rejected — filling engines, repository.directory and a LICENSE file on the published packages, none of which any gate here can hold honest.
---

# Published package metadata

The published packages declare no `engines`, no `repository.directory`, and ship no `LICENSE` file beside the `license` field that names one. Each is a field a stranger's install can read, none is filled, and all three stay that way.

## The property they lack

Every published-surface promise this repository makes is **derived by the build and checked by a gate**. The `exports` map is generated rather than hand-written, so a new entrypoint cannot ship without the manifest reaching it. The externals are gated against the manifest's own runtime fields, so a bundle may leave external only what it declares. `publint` and `attw` fail a build whose manifest points at a file it does not ship or whose declarations break under a resolution mode a consumer might pick. The one edge no build gate can see — a published package naming a private sibling — is asserted by a workspace invariant test instead.

A metadata field is neither derived nor checkable. Filling one adds a claim with nothing behind it, and this repository already treats that as the failure worth avoiding: `sideEffects` is declared by every package precisely because absence reads as nobody having considered it, and a test enforces the part that _is_ derivable rather than the part that is a judgement. These three fields are the judgement half with no derivable half underneath.

## Why each one

**`engines` is not derivable, and wrong is worse than absent.** It is a claim about the minimum runtime each `dist` can run — not a fact the build computes. The range `engines.node` asks for at the repo root is the _development_ requirement; publishing it as the consumer requirement overclaims, and the cost of overclaiming is blocking an install that would have worked. Nothing here can hold a hand-picked range honest either: the rules that read `engines.node` and fail on syntax or built-ins newer than it ship with `eslint-plugin-n`, and oxlint does not port them — its node plugin carries no `no-unsupported-features` rules at all. Writing our own would mean owning a Node compatibility table mapping every API and syntax form to the version that introduced it, which is more maintenance than the field was ever going to save.

**`repository.directory` is derivable and buys almost nothing.** It moves only when a package moves, which is close to never and is already a moment someone is editing the manifest. What it changes is where npm's repository link lands — the monorepo root today, the package's own subfolder if it were set.

**A `LICENSE` file cannot be shared, only copied.** Every manifest names its license, which is the field npm and licence scanners read; what is absent is the text beside it. The tempting fix does not work: `npm pack` skips symlinks, so a package symlinked to the root licence ships **nothing** while the tree looks correct — a gap that reads as solved is worse than one that reads as open. The honest fix is a real copy in every package, immutable boilerplate that never drifts. It is refused for its benefit rather than its cost: the licence is already declared where tooling looks for it, and the text is one click away in a public repository the manifest links.

## The revisit trigger

Not the effort — none of these is expensive. What changes the answer is a consumer, or an enforcer.

For `engines`, oxlint porting the `no-unsupported-features` rules, which would make a declared range self-correcting instead of a number to maintain. For `LICENSE`, an actual downstream licence audit or a consumer asking for the text in the tarball; a published package acquiring users outside this repository moves the whole page, because every one of these fields exists for a reader we do not currently have.
