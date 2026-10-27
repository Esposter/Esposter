# Roadmap

Open work, each item linking its proposal. Rationale lives in [serialization](../../specs/architecture/serialization/README.md).

## Open

- [ ] [Message kind registration](../../specs/architecture/serialization/azure-table-path/spec.md) — the table-read requirement says a new stored message kind is registered in the shared class registry as well as in `MessageTypeEntityMap`, while the [class registry's](../../specs/architecture/serialization/class-registry/spec.md) table-read scenario says the shared registry needs no entry for a new kind. The code registers per class: `JSONClassMap` is keyed by class name, so a kind that reuses a registered class needs only its `MessageTypeEntityMap` entry, and a new class needs an entry in both. Decide whether the registry entry is per kind or per class, then make the two specs say the same thing in the same change
