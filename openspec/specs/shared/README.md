# Shared

`packages/shared` (npm `@esposter/shared`) is the TypeScript code the app and the server both import: error classes, the neverthrow helpers, Zod schemas and the utilities that once came from a dependency. A utility that replaced a dependency has its own page here, with the upstream table of that dependency's issues and the test that proves each verdict.

- [Profanity check](profanity/design.md) — an English word list and a whole-word matcher, replacing `@2toad/profanity`.
- [Typed event emitter](typed-event-emitter/design.md) — the app's game event bus, replacing `eventemitter3`.
- [Deep equality](deep-equal/design.md) — `checkIsDeepEqual`, which replaced `fast-deep-equal`.
- [dedent](dedent/design.md) — the template tag that strips a template's indentation, replacing `dedent`.
- [IndexedDB](indexed-db/design.md) — the typed IndexedDB wrapper, replacing `idb`.
- [IndexedDB upgrade logging](indexed-db-upgrade-log/spec.md) — a failed upgrade is logged once, with the message its callback threw.
- [Media types](mime-types/design.md) — the extension and media type lookup over `mime-db`, replacing `mime-types`.
- [HTML sanitiser](sanitize-html/design.md) — `sanitizeHtml` over parse5, replacing `sanitize-html`.
- [Roadmap](../../changes/shared-roadmap/tasks.md) — open decisions in the shared utilities, each linked to its proposal.
