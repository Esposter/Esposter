# Nuxt Security Module Roadmap

## Why

The package's README lists what is not built yet, and that list is the only index of the work its own spec calls owed. The repository's roadmaps cover esbabbler, genshin, infra, post and resource, so a session that picks up new work reads none of it. The list also carries an item the audit no longer supports: its FEATURE rows are the feature requests the audit judges worth having, and the audit's own [decisions not built](../../specs/nuxt-security-module/upstream/design.md#decisions-not-built) say none of the 49 met that bar. This is gap 12 of the [gap survey](../gap-survey-2026-10-25/proposal.md).

## What Changes

The package gets a roadmap, `nuxt-security-module-roadmap`, and its open work is ordered there.

- **Three items, in order.** Running the plugins in a built app comes first, because the SRI check after it needs a built app. The SRI check on preload links (#655) and entry import maps (#657) follows, since #657 is a medium defect that blocks scripts on dynamic imports. The regression tests checked against upstream come last: that check is cheap and needs nothing else.
- **Each item links the page that holds its source.** A roadmap item does not carry a proposal of its own. The gap survey's rule is that a proposal is written when its change is picked up, so each item names the page that states what is owed now, and its change is written then.
- **The FEATURE item is dropped.** The audit already decided against every feature request as new work, so no FEATURE row is owed. Keeping the item would leave a claim with nothing behind it.
- **The package README's list links here.** When this change ships, the list in the README is replaced with a link to the roadmap, so the work is written in one place. Two lists would drift, and the one in the README is the one that already went stale once.
- The prerendered headers file is no longer on the list. It was removed with the two options that named it, and it is recorded as a deferred idea ([prerendered headers file](../../deferred/nuxt-security-module/prerendered-headers-file/design.md)).
- **Why a roadmap and not one proposal.** The three items are independent changes, each with its own design, so one proposal would carry three designs. The roadmap is the index over them, as the other areas' roadmaps are.
- **Capabilities:** none. A roadmap carries no spec delta.

## Waiting on

None.

## Impact

- The package README's list of unbuilt work, which is replaced by a link to this roadmap when it ships.
- The package's status paragraph, which keeps its statement of what is built.
