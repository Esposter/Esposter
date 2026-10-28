# Constant Maps

Read when adding a map keyed by an enum or a discriminant, or when deciding whether a second map may share its file.

## Where one lives

A map is a value rather than a type, so it lives in `services/` — or `assets/` when its entries are content
rather than wiring. `models/` holds classes and interfaces, and a map placed there routinely ends up importing
the service that builds its entries, which inverts the layering.

## Naming and typing

**PascalCase matching the filename, with `as const satisfies`** — `export const FooConfigurationMap = { ... } as const satisfies Record<...>`. Per-variant definition maps and their `as const satisfies` mapped type are the `typescript` skill's (`references/type-modelling.md`).

**Exception**: when consumers need optional interface fields visible after enum lookup (e.g. `Item.isDanger` on a map where some entries omit it), annotate explicitly — `const MapName: Record<Enum, Interface> = { ... }` — which widens lookup results to the shared interface while still enforcing every enum key.

**Keys are enum members, never literal names** — `[Enum.Member]: …`, which `enum-map/no-literal-map-key` (`scripts/src/services/oxlint/enumMap`) enforces; a closed set of string keys that is not an enum yet is an enum first. Two maps keep their literal keys: an open set, a map typed `Record<string, …>` (also through `Partial`, `Readonly` or `Required`), since no enum can name its keys; and a map keyed by numeric dataset ids, which no enum can name either.

**Under `isolatedDeclarations`, an exported map is annotated.** `as const satisfies` cannot be inferred for an export, so in a package with declarations on, the annotation carries the key set: `export const FooMap: Record<Enum, Value> = { ... }`, as `SinColorMap` does in `packages/genshin-mods/src/services/sins/SinColorMap.ts`.

**Reuse existing item interfaces for UI metadata maps** instead of re-declaring an inline entry shape — the `Item` interface and its narrower alternatives are the `vue-page-composition` skill's (`references/action-items.md`).

## One map per file

`FooConfigurationMap.ts` exports only `FooConfigurationMap`. Never colocate two independent maps in one file.

**A map nothing exports stays in the file that reads it.** The "One map per file" rule on this page places an _exported_ map; under
`packages/*/src`, extracting a module-private one is not a move but a publication, because the generated barrel lists every
export in the tree and the package's public API grows by a wiring detail nobody outside can use. The map is at
the top of its consumer's file, above the runtime logic, like any other local declaration.

**Exception**: a map that only indexes declarations already in that file (a `type → schema` lookup beside the discriminated union built from those same schemas) stays with them — it has no existence apart from them, and splitting it would import every sibling straight back. This is the Zod colocation exception applied to a map.

When a map transforms another (e.g. omitting a key), derive it rather than restating the entries: `[Foo.Bar]: FooSchemaMap[Foo.Bar].omit({ name: true })`.

## Consuming one in a template

**Destructure in `v-for` unless passing the base item as props** — `v-for="{ key, format } of FooDefinitions"` over `v-for="definition of ..."` when only specific fields are needed. Exception: if the item itself is passed as a prop (`<SomeCard :item="definition" />`), don't destructure.

## MIME types belong in the map, not in a runtime lookup

Store MIME type strings in the relevant configuration map (e.g. `DataSourceConfigurationMap`) rather than calling `lookup` from `@esposter/shared` at runtime — its first call reads the whole `mime-db` dataset (about 200 KB) into the bundle that makes it. Access `mimeType` through the configuration map at the call site.
