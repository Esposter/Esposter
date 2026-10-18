# Agent keys

## Why

Keys carry scopes, and reads are marked read-only and name their key, so an agent's writes are attributed. Two parts are still open. Keys created before scopes existed hold no permissions, so they reach no tool: a follow-ups drain that worked yesterday is refused every tool until its owner makes a new key. And some operations should never reach a key whatever its scopes, because nothing can undo them: purging a resource, deleting a respondent's survey answer, and the procedures a respondent uses to answer a survey. Those stay with the owner's own hand.

## What Changes

Keys made before scopes keep working for the follow-ups, and the operations nothing can undo are kept from every key.

- Each key created before scopes gains the follow-ups scope and nothing else, applied at application startup. Keys that already hold scopes are not changed.
- A procedure can declare itself human-only, with a reason. Keys are never served a human-only procedure, whatever scopes they hold.
- Purging a resource, deleting a survey response, and the survey respondent procedures declare themselves human-only.
- Operations that a revision, the recycle bin or an unpublish can undo remain open to a key that holds their scope.
- Every procedure a resource type adds beyond the generic set must declare how keys reach it or why it is human-only, checked in CI. The check lands with the lifecycle tools change, which declares the remaining procedures.

## Capabilities

- **architecture/ai-native-resources/agent-keys** (new)

## Waiting on

- `openspec/changes/architecture-ai-native-resources-lifecycle-tools/`: the declaration check lands with it, and that change decides the remaining type-specific procedures.

## Impact

- The key store: a startup data step that gives the follow-ups scope to keys that hold no permissions.
- The tool list served to agent keys: human-only procedures are left out of it.
- Resource purge and the survey response procedures on the owner's side, marked human-only.
- A CI check over every resource type's own procedures.
