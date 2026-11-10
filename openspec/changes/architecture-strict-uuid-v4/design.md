# Strict v4 ids

Ids are validated as v4 everywhere, and the fixed ones are v4-shaped, so the swap from the lenient validator is one commit with nothing to special-case.

## Why

See `proposal.md`. This page holds the choices that are not obvious from it.

## Decisions

- **Strict v4, not `z.guid()` and not `z.uuid()`.** Every real id is a v4, so the narrowest validator that accepts all of them is the right one. `z.guid()` accepts any hex in the UUID layout and says least. `z.uuid()` accepts versions 1 to 8 and says more than the data is.
- **The all-zero v4 is the fixed id, never the nil UUID.** `00000000-0000-4000-8000-000000000000` passes strict v4, and the pure nil does not, so a sentinel written as the nil would break the swap. The shared constant is `ZERO_UUID`; the sentinels `AUTOMOD_USER_ID` and `NO_SURVEY_ID` are that value, so neither changes on the day of the swap.
- **A second row of one table steps the last digits of the v4 form** (`...0001`, `...0002`). The version and variant digits stay `4` and `8`, since a zero in either fails the validator. Ids of different tables share `ZERO_UUID`, since they never meet.
- **A test's real id is `crypto.randomUUID()`.** A fixed id is for a value whose text the code reads: an outline seeded from an element's id, a seed identical on every run, a sentinel. Where the text of a random id appears in an asserted output, the expectation interpolates the variable.
- **The swap is its own commit.** It touches every id schema and is reviewed on that alone. Nothing in the build that makes the fixed ids v4-shaped waits on it.
- **Rejected: weakening the validators to accept the nil.** The nil is special-cased by `z.uuid()` for historical reasons, and the repo has no id that is nil.

## Open before the swap

Sources of ids that might not be v4 are listed and answered first: the auth library's generated ids for users, sessions and accounts, ids that arrive from an external provider and are stored in an id column, and every Azure Table key that holds an id. An id source that is not v4 is either made to mint a v4 or its field keeps a lenient validator with the reason beside it.

## Key files

| Source                                                 | Role                                                      |
| :----------------------------------------------------- | :-------------------------------------------------------- |
| `packages/shared/src/services/uuid/constants.ts`       | `ZERO_UUID`, the all-zero v4 every fixed id builds on     |
| `packages/db-schema/src/services/message/constants.ts` | `AUTOMOD_USER_ID`, the reserved moderation actor          |
| `apps/web/shared/services/pageBuilder/constants.ts`    | `NO_SURVEY_ID`, the "no survey" sentinel                  |
| `apps/web/shared/util/id/uuid/checkIsUuidV4.ts`        | The strict v4 check the client already guards routes with |
