# IndexedDB mock

The app's caches and the shared [IndexedDB wrapper](../../../specs/shared/indexed-db/design.md) are tested against `fake-indexeddb`, which the app's Vitest config loads for every suite through `fake-indexeddb/auto`. The idea was to put our own in-memory IndexedDB in a workspace package, as `azure-mock` is for Azure, and to load it only in the suites that open a database.

## Why not

**`fake-indexeddb` is not a mock; it is an implementation of the specification.** It implements the W3C IndexedDB standard in memory and is checked against the web-platform tests the browsers run. What the cache tests lean on is the specification's behaviour: a transaction that commits once nothing is queued on it, the order of version-change events, key ordering and the structured clone of what is stored. An implementation of our own would be a second copy of a specification that changes without us, the stop list's first rule ([dependency admission](../../../specs/architecture/dependency-admission/design.md)), and the half it got wrong would be the half no test thought to check.

**`azure-mock` is not the precedent.** It mocks SDK classes for services that have no in-memory implementation to install. IndexedDB has one.

**Scoping the setup entry trades one line for many.** The wrapper reads the `indexedDB` global only when a database is opened, so only the suites that open one need it, but the cache composables reach it through the components that mount them, across a large share of the app's suites. A per-suite import is a line each of those owes, and a new suite that forgets it fails with `ReferenceError: indexedDB is not defined` rather than at review. The global entry costs one line and a devDependency that ships nothing to the client, so it moves no bundle score.

## The revisit trigger

The test environment implementing IndexedDB itself, which retires the setup entry outright (the probe is in the [test harness workarounds](../../../specs/architecture/test-harness-workarounds/design.md)), or `fake-indexeddb` falling behind the specification the browsers ship.
