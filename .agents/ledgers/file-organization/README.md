# File organization

The question is where a thing lives and whether it exists twice — one function per file, no magic string where a constant already means it, no duplicate constant, the sole-consumer subfolder rule, alias imports, and an interface or type in its own model file rather than beside the code that reads it.

## Areas

The areas and their units are the shared [area list](../areas/), and `pnpm ai:sweep:status file-organization` says where each unit stands. It keeps an area file only for the units it holds a note on: [app-shell](app-shell.md), [dungeons](dungeons.md), [messaging](messaging.md), [packages](packages.md), [resource](resource.md), [server](server.md) and [shared](shared.md). A pass loads this file, the unit's bullet in the list and this ledger's file for the area where it has one.

## Find recipe

```bash
pnpm ai:sweep:file-organization
```

The scan lives in `scripts/src/sweeps/fileOrganization/` rather than in this file because it is a program: whether
a second export is a second concern is a comparison of names word by word against the exceptions the
`file-organization` skill names, and a grep cannot hold that. It also reports a private top-level function beside another function, the half of one function per file that no export count sees. What it prints is a candidate list for the pass,
never a finding: the skill's exceptions are a roster no scan can hold, so no workspace test asserts the list
empty, and a unit is dated by reading it, not by the scan coming back clean. Its cases are
`getFileOrganizationFindings.test.ts`, which is what keeps "prove the scan can fail" proved.

A duplicate constant is the one thing the scan does not read, because it is found by value rather than by name. `pnpm ai:sweep:duplicate-literal` prints each string literal two or more source files hold, with its file count: the candidate list, not the finding.

## The consumer scan

The ≥2-consumers rule is answered by counting the **packages** that name each export, which needs the whole repo
in memory rather than a grep per name:

```bash
pnpm ai:sweep:shared-export-consumers
```

It excludes the export's own **package**, not merely its own file: `packages/shared` naming its own export is the
library using itself, and counting that would let one real consumer clear a threshold that asks for two. An
export the package's other files read is a piece of one that does clear it and is not reported. What is reported
says what the pass does: `move to <package>` for an export one package alone names — it goes beside that consumer,
its colocated test with it, and the alias import replaces the barrel one — and `dead` for an export nothing names in a
file the barrel re-exports. knip's default run skips those as entry exports and reports every other file's unused
exports itself (`knip.config.ts`).
A clean pass prints nothing, and `scripts/src/workspace/packages/sharedExportConsumers.test.ts` fails on anything it
prints, so the rule is enforced rather than swept.

## Exclusions

- Generated barrels (the generated `index.ts`) and `snapshot.json` — machine state.
- Literals a postinstall-evaluated or JSON config must repeat, which the skill names as the one sanctioned duplication.
- Two exports sharing module-private state through closure — a pending set, a cached promise, a code set, a
  dispatch map, the four names `initTRPC` hands out. One-function-per-file cannot reach them without making that
  state a module global, which trades a file boundary for a wider one.
- A local type in a package's `src` that its own file alone reads (`createTileStreamer`'s `CachedTile`): a `models/` file is a module, and the generated barrel publishes every
  module, so extracting it would make a private shape public API. The same reason the `file-organization` skill
  gives a module-private map (`references/constant-maps.md`).
- A local type in a script outside its package's `imports` map (`packages/db-schema/scripts/`): it has no alias to
  reach a models file through, and a relative import is the one shape the alias ban refuses.
- A generator's emitted source (`get*Source`): the `export` lines the scan reads there are the text it writes into
  a generated file, not exports of its own.
- A screen's `Index.fixture.ts`: its named exports (`props`, `variants`, `slot`, `isMotionOnly`) are the contract the
  parity page and the visual suite read by name, so one fixture is one concern however many names it exports.
- A map and the key list derived from it (`ModNames` as `Object.keys(ModDescriptionMap)`, `VoiceDeviceKinds`): the
  list is the map read another way, a concern of the map's rather than one of its own.
- A type derived from the function beside it (`server/trpc/context.ts`'s `Context`, built on `createContext`'s return type):
  a models file would import the function back, so the type has no home that does not read the file it left.
- A table read as two entities keeps both select schemas in the table file (`posts` as comments): the second
  schema is derived from the same table, so it is the table's concern rather than a second one.
