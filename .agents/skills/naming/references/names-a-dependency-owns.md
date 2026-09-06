# Names a Dependency Owns

Read when naming something that mirrors a dependency — a field handed straight to a library's option, a wrapper
over its call, a key it reads back out, a method its interface declares, or a value off its wire.

Every other rule in this skill applies to names **we** author. This page is the one boundary they all stop at,
and it is stated once here because it otherwise gets re-derived in whichever section the collision happened to
land in.

## The test

A name is the dependency's when the dependency itself reads or writes that exact string. Renaming one of those
does one of two things, and both are worse than the convention it was bought with:

- **It breaks a lookup silently.** The rename typechecks, reads as the convention applied, and stops working —
  because the thing doing the lookup is not the TypeScript compiler.
- **It puts our vocabulary and theirs one hop apart at every call site.** The reader has the library's own
  documentation open beside the code; a renamed field means translating each line before it can be checked
  against the page it came from.

The exemption is not limited to names we are _unable_ to change. A field we could rename freely is still the
dependency's if that is the spelling its documentation uses.

**Where it stops:** the moment the name is ours. A flag we invented, a value we derive before handing it over, or
our own key sitting beside a foreign one is named the way any other identifier is.

## The shapes it takes

- **A field mirroring an option.** A model field whose value is passed to a dependency's option of the same
  name, or a type declared field-for-field against one of theirs, keeps that library's spelling — `is*` prefix
  included, or omitted.
- **A key the dependency looks up.** `packages/app/shared/types/nuxt.d.ts` mirrors nuxt's own module
  augmentation, so its keys are an upstream contract: renaming `noScripts` to `scriptCount` typechecks and
  silently stops Nitro applying the rule, because the key it looks up no longer exists. The tell is a file whose
  comment says to keep it in sync with the dependency's source — a declaration file restating a dependency's
  interface, or any object literal a dependency reads, is out of scope for a naming pass entirely.
- **A method their interface declares.** azure-mock's `byPage` on `PagedAsyncIterableIterator` is the Azure
  SDK's paging contract rather than a lookup we named, so the `<key><value>Map` rule does not reach it.
- **A destructure their documentation spells.** `ctx` is the name for a tRPC context value, in source and tests
  alike, because it mirrors tRPC's own `{ ctx }`. Expanding one file's to `context` desyncs that file from every
  call site.
- **A truncation they authored.** The no-abbreviations rule expands `Nav` to `Navigation` because that name is
  ours; `v-navigation-drawer`'s `VNavigationDrawer` is already spelled out, and `VBtn` is Vuetify's truncation to
  keep.
- **A verb on a thin wrapper.** `listBlobNames` and `listRoomProfileImageBlobNames` sit on
  `@azure/storage-blob`'s `listBlobsFlat` and are read beside that SDK's documentation. The exemption is the
  operation's verb alone, and only while the dependency's call is the whole body — anything deriving an answer
  from a listing is a `read*` like every other fetch.
- **A value off their wire.** A provider's error code read off a redirect query, or a field of a third-party
  payload we accept or emit verbatim, keeps that provider's spelling, `snake_case` included. Type the map's key
  as `string` when the library exports no union for it — most don't, and hand-copying their literals into a union
  drifts silently — and give the lookup a fallback so an unmapped value degrades instead of rendering blank.
- **An env var with its own API.** Our own flags are the strings `"true"`/`"false"`; `NO_COLOR` is presence-based
  and `FORCE_COLOR` uses supports-color's scale (`"0"`/`"false"` off, `"1"`/`"2"`/`"3"` for 16/256/truecolor).
  Read and set those per their spec.

## One name can be two identifiers

A wire manifest's `isSnapshotLowerPath` **field** and a predicate **parameter** of the same name are not the same
identifier. The field is a stored boolean and keeps `is*`; the parameter is called and takes `check*`. A rename
driven by whole-word substitution cannot tell them apart — it renames the field, the schema key and the wire key
together, and what fails is an unrelated inline snapshot rather than the parse. Check what each occurrence is
attached to before rewriting it.
