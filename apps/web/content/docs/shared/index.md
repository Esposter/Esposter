---
title: Shared
description: The utilities in @esposter/shared that replaced a dependency, and where each one's upstream audit lives.
---

# Shared

`packages/shared` (npm `@esposter/shared`) is the TypeScript code the app and the server both import: error classes, the neverthrow helpers, Zod schemas and the utilities that once came from a dependency. A utility that replaced a dependency has its own page here, with the upstream table of that dependency's issues and the test that proves each verdict.

- [Typed event emitter](/docs/shared/typed-event-emitter) — the app's game event bus, replacing `eventemitter3`.
- [Deep equality](/docs/shared/deep-equal) — `checkIsDeepEqual`, which replaced `fast-deep-equal`.
