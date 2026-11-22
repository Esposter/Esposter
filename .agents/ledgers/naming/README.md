# Naming

## Areas

The areas and their units are the shared [area list](../areas/), and `pnpm ai:sweep:status naming` says where each unit stands. It keeps an area file only for the units it holds a note on: [app-shell](app-shell.md), [dungeons](dungeons.md), [messaging](messaging.md), [packages](packages.md), [products](products.md), [resource](resource.md), [server](server.md), [shared](shared.md) and [tooling](tooling.md). A pass loads this file, the unit's bullet in the list and this ledger's file for the area where it has one.

A component file name is in scope for its **words** — the rule spelling `Navigation` over `Nav` reads a filename
the same way it reads any other identifier. The prefix-and-fold question over that same tree stays
`vue-components`'s: one tree, two questions, which is what keeps both ledgers whole. Nothing is excluded here on
the grounds that a rename is expensive — that is the argument
[no compatibility debt](../../../openspec/specs/architecture/no-compatibility-debt/design.md) already refuses, migrations included.
