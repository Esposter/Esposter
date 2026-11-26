# Tasks

## 1. Store

- [ ] 1.1 Replace the post count store with the derived field store: held values by table, row and field with their versions, pending predictions by write, and the read as held plus pending, applied at the overlay's version rule. Write the store tests first, holding "A read landing during a pending write keeps the prediction" and "An older read never overwrites a newer held value", and see them fail before the store exists. Verified by `pnpm test app/store/derived --run` from `apps/web` passing.
- [ ] 1.2 Settle each write's predictions on its answer, read back the values a settled write touched, and drop them with a read-back on a refusal. Write the tests first, holding "An answer replaces the prediction at the version it carries", "A settled write reads back the values it touched" and "A refused write drops its prediction and reads the value back", and see them fail first. Verified by those tests passing.

## 2. Predictor

- [ ] 2.1 Run the predictor inside the overlay write, taking each recorded row's difference from the held row it replaces, and starting a new row's own counts at zero. Write the tests first, holding "A vote shows its count at once on the post", "A vote change moves the count by the difference from the held vote", "A reply shows the counts of the posts above it at once" and "A new reply starts its own count at zero", and see them fail first. Verified by `pnpm test app/store/post --run` from `apps/web` passing.
- [ ] 2.2 Predict a removal's change to the posts above it only from a held, current subtree count. Write the tests first, holding "A removal with a held subtree count predicts each post above it" and "A removal with no held subtree count waits for its answer". Verified by those tests passing.
- [ ] 2.3 Take a reply's inherited values from its held parent, and hold the reply until its answer when the parent is not held. Write the test first, holding "A reply to a parent not held shows once its answer arrives". Verified by that test passing.
- [ ] 2.4 Hold the predictor to the answer: run sampled writes through the predictor and the server, and check that each prediction equals the answer it settles to where the held rows equal the server's. Write the test first, holding "A prediction equals the answer it settles to", and see it fail when the difference is deliberately made wrong. Verified by that test passing under `pnpm test app/store/post --run` from `apps/web`.

## 3. Reads

- [ ] 3.1 Route every display of a derived value through the store, replacing the version check the post rows make, and keep the room totals read as it is. Verified by the post row and room totals tests passing, including "a leave re-reads the room's totals instead of decrementing them" and "an older read never overwrites a newer one".

## 4. Types and enforcement

- [ ] 4.1 Type the client's drafts and patches without derived keys, type the reply placeholder as a draft so it no longer computes its ranking, and retire the count lint selectors and their tests, since the readonly types refuse the same writes on the client. Verified by the typecheck passing, and by the restricted syntax tests holding no selector for a count field.

## 5. Specs

- [ ] 5.1 Rewrite the client-data design and the likes design as built, and check the modified scenarios against the tests that hold them: "A mark of the viewer changes at once", "A count moves at once by the vote", "A refused vote drops its mark and the count is read back", "A vote on a post page shows on its feed card" and "A refused vote is dropped from every copy on screen". Verified by `pnpm test app/components/Post app/store/post --run` from `apps/web` passing, and by a read of each modified scenario against its test.
