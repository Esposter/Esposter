## Why

Every id the app mints for its own rows is a v4: Postgres `gen_random_uuid()` for a row, `crypto.randomUUID()` for a client-made one. The validators accept more than that: `z.uuid()` takes versions 1 to 8 and the all-zero nil UUID, so an id that no code path makes still passes input validation, and a fixed id written by hand can be spelled in a form that only some validators accept. One strictness, applied everywhere, makes the validators say what the data is.

## What Changes

- Fixed ids (a sentinel, a seed, a fixture's pinned id) are v4-shaped already: `ZERO_UUID` in `@esposter/shared` is the all-zero v4, and a second row of one table steps its last digits. This is built.
- Every id validator is the strict v4 form, `z.uuidv4()`, not `z.uuid()`, which takes versions 1 to 8 and the nil UUID. The sources of ids and their answers are in `design.md`.
- The `zod` and `test-values` skills carry the rule, so a hand-typed or pure-nil id is not written again.

## Capabilities

### New Capabilities

- id-validation (architecture/id-validation): ids are validated as v4, and a fixed id is v4-shaped.

## Impact

Every schema that declares an id field, the id schemas shared between packages, and the router inputs that take an id. No stored row changes: `AUTOMOD_USER_ID` was already the all-zero v4, and `NO_SURVEY_ID` moved from the nil UUID to it with no migration, since nothing is in production.
