## 1. Transport

- [x] 1.1 Compile an email of any realistic length in one request, so Preview shows its html rather than a 431. Verify: a test named after the scenario 'a long email previews as a short one', seen failing first.
- [x] 1.2 Change `email.compile` from a query to a mutation and its client call from `query` to `mutate`, with the router tests and the Preview tests updated to match. Verify: the preview, email router and router index suites pass, 12 of 12.

## 2. One compile per settled edit

- [x] 2.1 Send one compile when the edit settles, not one per edit in a run of keystrokes. Verify: a test named after the scenario 'a run of edits compiles once', seen failing first.

## 3. Sweep

- [x] 3.1 Update the email design's Preview paragraph from "through a query" to a mutation carrying the document in its body, and its Key files row for the router. Verify: the design is reread against the router and Preview.vue.
