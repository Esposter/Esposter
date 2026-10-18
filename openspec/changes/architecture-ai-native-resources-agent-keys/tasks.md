## 1. Keys made before scopes

- [ ] 1.1 At application startup, give the follow-ups scope to every key whose permissions are empty, and leave keys that hold scopes unchanged. Verify: a test named after the scenario 'A key created before scopes can run the follow-ups', failing first, then passing; and the scenario 'A key that already holds scopes keeps them'.

## 2. Operations nothing can undo

- [ ] 2.1 Let a procedure declare itself human-only with a reason, and leave such procedures out of the tool list built for a key. Verify: a test named after the scenario 'Human-only operations are not listed to a key with every scope', failing first, then passing.
- [ ] 2.2 Declare purging a resource, deleting a survey response, and the survey respondent procedures human-only. Verify: a test named after the scenario 'A key cannot call a human-only operation by name', failing first, then passing.
- [ ] 2.3 Confirm the operations a person can undo stay served to a key with their scope. Verify: a test named after the scenario 'A key moves a resource to the bin and back' and the scenario 'A key publishes a resource', both failing first where they do not yet hold, then passing.

## 3. The declaration check

- [ ] 3.1 Add the check over every resource type's own procedures, found by type name, with the generic set taken from the factory so no procedure is listed by hand. It lands with the lifecycle tools change, which declares the remaining procedures. Verify: a test named after the scenario 'A new type-specific procedure without a declaration fails CI', failing first, then passing once the remaining procedures declare.
