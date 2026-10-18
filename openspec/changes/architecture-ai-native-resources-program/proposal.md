# AI-native resources

## Why

Every resource editor in Esposter is built for a person's pointer and keyboard. An agent reaches the app through one MCP endpoint, and generic tools find, describe, read and patch every type's document. The rest of what a person does is still closed to it: an agent's save strands the owner's open editor behind a refresh, and creating, publishing, linking or rolling back a resource has no tool. Adding tools one editor at a time is how the endpoint came to reach a single type, so the agent surface is wired once, at the resource layer, from what each type already declares.

## What Changes

The goal: whatever a person can do in a resource editor, an agent can do through a typed operation derived from what the type already declares, never written per type.

- Every resource type's lifecycle is served to agents as one generic tool per operation: create, rename and tag, bin and restore, duplicate, publish, file upload and removal, references, activity, history and datasets.
- An agent's saved edit appears in the owner's open editor of any type without a refresh, and an unsaved edit there is offered as a choice.
- Operations that nothing can undo stay with the owner, and no key is served them.
- An act whose result the editor computes, such as renaming a Sheet column or ticking a repeating todo, is a typed command running the editor's own code, not a patch an agent works out by hand.
- An agent's write the type's schema does not describe is refused rather than guessed, and captured markup derived in the browser is read-only to agents.
- The person's Ask Claude command hands their line to their own Claude Code session, which edits through the same tools as any agent.

## Capabilities

None of its own: each part's change carries its capability under `architecture/ai-native-resources/`, and the refusal of an undescribed write is built (`openspec/specs/architecture/agent-content-tools/spec.md`).

## Waiting on

- `openspec/changes/architecture-ai-native-resources-agent-keys/`: the keys made before scopes and the operations that stay the owner's.
- `openspec/changes/architecture-ai-native-resources-live-edits/`: the open editor adopting an agent's save.
- `openspec/changes/architecture-ai-native-resources-lifecycle-tools/`: create, rename, tag, delete, restore, publish, references, history and each type's own procedures.
- `openspec/changes/architecture-ai-native-resources-typed-commands/`: the Sheet's column commands, a repeating todo's tick, and a Note written as Markdown.
- `openspec/changes/architecture-ai-native-resources-in-product-assistant/`: Ask Claude, once the agent console pairs a host again.
- `openspec/changes/resource-page-builder-program/`: its cutover makes the Webpage and the Email described all the way down, with no unit of this program's own.

## Impact

- The cross-type resource router and the agent tool bridge, which serve the generic tools to any key holding the matching scope.
- Each resource type's content declaration, which the generic tools read to describe, check and write a document.
- The resource save stream and the open editors of every type, which adopt another device's save.
- Each type's own procedures, reached by agents only where they are the owner's act.
- A CI check over every type's described surface, and a CI check over every type's own procedures.
