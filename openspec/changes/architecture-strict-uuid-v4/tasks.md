# Tasks

## 1. The fixed ids

- [x] 1.1 The shared constant is the all-zero v4 and every fixed id builds on it. Verify: `AUTOMOD_USER_ID` and `NO_SURVEY_ID` read `ZERO_UUID`, and a search of the test files finds no spelled-out id but the seeded ones of the SVG test.

## 2. The id sources

- [x] 2.1 List every source of an id that reaches a validator and answer whether it is a v4: the auth library's user, session and account ids, external provider ids stored in an id column, and Azure Table keys that hold an id. Verify: each source is named in design.md with its answer, replacing the open section.

## 3. The swap

- [x] 3.1 Move every id validator to the strict v4 form in one commit. Verify: the test named after the scenario 'An id of another version is refused' written first and seen failing.
- [x] 3.2 Confirm the fixed ids pass and the nil UUID does not. Verify: the test named after the scenario 'A fixed id passes' written first and seen failing.
- [x] 3.3 Confirm a real id passes. Verify: the test named after the scenario 'A real id passes' passes under the strict form, a case the lenient form also passes, so it holds the claim rather than the swap.
