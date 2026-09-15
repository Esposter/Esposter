# Which folder a file goes in

Read when creating or moving a file and choosing between `models/`, `services/`, `utils/`, a feature subfolder and
a `shared/` bucket. The one-line map is in `SKILL.md`; this page is each layer's boundary and the exceptions that
sit on it.

## `models/` — classes, interfaces and types

**One class per file**, in a `models/` folder. `models/` is strictly classes and interfaces/types.

## `services/` — exported functions

Factory functions, command creators, and other exported functions.

**Exception: the nullary factory that hands a model its own field default stays beside the type it constructs** —
`getInitialWorld` in `World.ts`, read only by `Save`'s `world = getInitialWorld()`. Where the type is derived from
the value — `type Settings = typeof InitialSettings` — there is nowhere else for it to go, since the model would
have to import a service to describe its own shape; where it is not, splitting the pair separates a default from the
type it belongs to for no reader's benefit. A default factory that takes an argument, branches, or is read by
anything but its own model is an ordinary service function (`createDefaultSheetSettings`).

**External library extensions go in `services/`** — helpers that extend or wrap third-party libraries
(`services/<lib>/doThing.ts`), not `util/`. A helper over a language global rather than a library is a `util/` one
(`util/date/formatDate.ts`).

## `utils/` — truly universal utilities only

Math, string, regex, type utilities, Node/browser engine extensions with no external dependency. If the helper
imports a third-party package, it belongs in `services/`. Generic browser utilities go in `app/utils/` (e.g.
`readFoo.ts`).

## Feature folders, and the one consumer

Group related models/services/components under a feature subfolder (e.g. `feature/sub-feature/`).

**Sole-consumer subfolder rule (CRITICAL).** A file lives in the subfolder of the **one feature that consumes it** —
which is what keeps a directory from accumulating twenty loose files from distinct sub-concerns. A `models/` folder
mirroring a `services/` folder mirrors its feature subfolders too. Don't over-fragment the other way: a shared bucket
stays whole even when large, and an already-feature-organised folder is not nested further.

## What two features share is `shared/`, not the layer root

Once a layer (`services/`, `models/`, `composables/`, `store/`, `util/`) has feature subfolders, its root holds
folders and nothing else: a cross-feature primitive goes in `<layer>/shared/`, which is a sibling of the features
rather than the absence of one. "It has no owning feature" is a fact about the file, and a fact is worth a folder
that states it — left loose it reads as a file nobody has filed yet, and the two become indistinguishable at about
the fifth one.

`shared/` nests like any other feature folder (`services/setterMap/shared/` is what `setterMap`'s own sub-features
share), and a layer with no subfolders at all has nothing to be shared _between_, so its files stay where they are
until it grows one.
