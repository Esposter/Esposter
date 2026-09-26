# Shared Configs

Read when writing or editing a package's `tsdown.config.ts`, or a factory in `packages/configuration/src/`.

Everything lives in `packages/configuration/src/`. Each export is a **factory** — call it, don't spread the export.

A package's `tsdown.config.ts` is one factory call plus only what is genuinely specific to it. If you are about to repeat a plugin, an exclude or a `deps` entry across two packages, it belongs in `configuration` instead. Which package calls which factory is countable from the repo — never restate it here.

The build script is bare `tsdown`. tsdown finds `tsdown.config.ts` by name; never pass `--config`.

## Compose with `mergeConfig`, never a spread

`mergeConfig(getTsdownConfigurationNode(), { deps: { alwaysBundle: ["x"] } })` — a spread of a
`getTsdownConfiguration*()` call is a `no-restricted-syntax` error. A spread replaces a key outright. Every nested option the base set on `deps`, `dts` or `exports` disappears the moment a package adds one field of its own, and nothing fails — the build just stops doing something it used to. This applies to the factories in `configuration` as much as to a package config.

`mergeConfig` merges those objects, but a colliding _array_ inside one is still replaced rather than concatenated — `plugins` is the one exception — so a package extending a base list has to restate the whole list, not just its own additions.
