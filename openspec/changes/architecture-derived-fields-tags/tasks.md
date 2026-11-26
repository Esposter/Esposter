# Tasks

## 1. Declaration

- [ ] 1.1 Add the declaration helper, the kind and prediction value sets, the declaration shape, and the collecting of each column's declaration onto its table. Write the test beside the helper first, holding "A column declared derived reports its kind and inputs" and "A declaration naming a missing input fails the schema build", and see both fail before the helper exists. Verified by the package's tests passing under `pnpm -C packages/db-schema exec vitest run`.
- [ ] 1.2 Classify every candidate column in the program's inventory against its writer, and declare its kind, inputs and prediction, or leave it an input with its reason recorded in the program's inventory. Verified by a read of each declaration against the writer it names, and by the change's record listing every column it reclassified.

## 2. Generated set

- [ ] 2.1 Write the generator that writes the derived set from the declarations, and the check that the set matches a fresh generation. Write the tests first, holding "A new declaration appears in the generated set on regeneration" and "A generated set that differs from the declarations fails the check", and see both fail before the generator exists. Verified by the check failing on an edited set and passing after regeneration.

## 3. Types

- [ ] 3.1 Add the type-level marker for a derived value, and the row, draft and patch types built from it. Write the type tests first, holding "A client write to a derived key is a type error" and "A draft of a new row omits its derived keys", and see their expected errors reported only after the marker exists. Verified by the package's typecheck reporting exactly the expected errors.

## 4. Runtime

- [ ] 4.1 Have the overlay's table descriptor report its derived names, and refuse a patch that names one. Write the overlay test first, holding "A patch naming a derived key is refused", and see it fail before the check exists. Verified by `pnpm test app/services/shared/overlay --run` from `apps/web` passing.
