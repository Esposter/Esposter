## 1. Typeless operations

- [x] 1.1 Serve create by type and name, and rename and tag, as generic tools. Verify: a test named after the scenario 'An agent creates a resource of a named type', failing first, then passing; and the scenario 'An agent renames and tags a resource'.
- [x] 1.2 Serve bin, restore and duplicate under the Resources scope. Verify: a test named after the scenario 'A resource moved to the bin and restored comes back whole', failing first, then passing; and the scenario 'An agent duplicates a resource'.
- [x] 1.3 Serve reading one resource, its activity and its references, with a link written into a document needing no tool. Verify: a test named after the scenario 'An agent reads what links to a resource', failing first, then passing; and the scenario 'A link written into a document appears in references'.
- [x] 1.4 Serve history, where a restore takes a revision first. Verify: a test named after the scenario 'A restore keeps the version it replaces as a revision', failing first, then passing.
- [x] 1.5 Serve dataset reads as one table. Verify: a test named after the scenario 'An agent reads a Sheet's rows as one table', failing first, then passing.

## 2. Dispatched operations

- [x] 2.1 Add the dispatching router, merged after the base router, which checks the resource type's publish capability and refuses in words when the type does not publish. Verify: a test named after the scenario 'A type that does not publish is refused in words', failing first, then passing.
- [x] 2.2 Dispatch publish and unpublish to the type's own publish procedure. Verify: a test named after the scenario 'An agent publishes and unpublishes a resource of a publishing type', failing first, then passing.
- [ ] 2.3 Dispatch file upload address requests and file removal. Verify: a test named after the scenario 'An agent uploads a file before its address expires', failing first, then passing; and the scenario 'An upload to an expired address is refused'.
  - Owed: the refusal of an expired address is Azure's, at the write SAS expiry the app sets (one hour from signing, `WRITE_SAS_DURATION_MS`). The mock signs that expiry as given, but its upload path never reads the `se` parameter, so no local test can show the refusal. The owner checks an expired address against dev storage, then this task is ticked.

## 3. Each type's own operations

- [x] 3.1 Serve Blueprint capture and deploy, Program participant and status, and Survey response reads to agent keys. Verify: a test named after the scenario 'Repeating participant generation returns the same tokens', failing first, then passing.
- [x] 3.2 Declare the remaining type-specific procedures, so the declaration check agent keys specifies passes in CI. Verify: its scenario 'Every type-specific procedure declares its key access' passes in CI.
