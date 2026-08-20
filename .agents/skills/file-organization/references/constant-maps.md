# Constant Maps

Read when adding a map keyed by an enum or a discriminant, or when deciding whether a second map may share its file.

## Naming and typing

**PascalCase matching the filename, with `as const satisfies`** — `export const FooConfigurationMap = { ... } as const satisfies Record<...>`. Per-variant definition maps and their `as const satisfies` mapped type are the `typescript` skill's (`references/type-modelling.md`).

**Exception**: when consumers need optional interface fields visible after enum lookup (e.g. `Item.color` on a map where some entries omit it), annotate explicitly — `const MapName: Record<Enum, Interface> = { ... }` — which widens lookup results to the shared interface while still enforcing every enum key.

**Reuse existing item interfaces for UI metadata maps** instead of re-declaring an inline entry shape — the `Item` interface and its narrower alternatives are the `vue-page-composition` skill's.

## One map per file

`FooConfigurationMap.ts` exports only `FooConfigurationMap`. Never colocate two independent maps in one file.

**Exception**: a map that only indexes declarations already in that file (a `type → schema` lookup beside the discriminated union built from those same schemas) stays with them — it has no existence apart from them, and splitting it would import every sibling straight back. This is the Zod colocation exception applied to a map.

When a map transforms another (e.g. omitting a key), derive it rather than restating the entries: `[Foo.Bar]: FooSchemaMap[Foo.Bar].omit({ name: true })`.

## Consuming one in a template

**Destructure in `v-for` unless passing the base item as props** — `v-for="{ key, format } of FooDefinitions"` over `v-for="definition of ..."` when only specific fields are needed. Exception: if the item itself is passed as a prop (`<SomeCard :item="definition" />`), don't destructure.

## MIME types belong in the map, not in a runtime lookup

Store MIME type strings in the relevant configuration map (e.g. `DataSourceConfigurationMap`) rather than calling `mime-types` `lookup` at runtime — `mime-types` uses Node.js `path.extname`, unavailable in the browser. Access `mimeType` through the configuration map at the call site.
