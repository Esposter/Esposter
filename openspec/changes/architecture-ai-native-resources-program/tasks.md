## 1. Units in build order

- [ ] 1.1 Agent keys: keys made before scopes gain the follow-ups scope, and the operations nothing can undo stay with the owner. Verify: `pnpm exec openspec validate architecture-ai-native-resources-agent-keys --strict --no-interactive` reports the change valid, and its tasks are complete.
- [ ] 1.2 Live edits: an open editor of any type adopts an agent's save, and an unsaved edit is offered as a choice. Verify: `pnpm exec openspec validate architecture-ai-native-resources-live-edits --strict --no-interactive` reports the change valid, and its tasks are complete.
- [ ] 1.3 Lifecycle tools: create, rename, tag, bin, restore, publish, references, history, datasets and each type's own procedures as generic tools. Verify: `pnpm exec openspec validate architecture-ai-native-resources-lifecycle-tools --strict --no-interactive` reports the change valid, and its tasks are complete.
- [ ] 1.4 Typed commands: the Sheet's column commands, a repeating todo's tick, and a Note written as Markdown once its converter ships. Verify: `pnpm exec openspec validate architecture-ai-native-resources-typed-commands --strict --no-interactive` reports the change valid, and its tasks are complete.
- [ ] 1.5 In-product assistant: Ask Claude, once the agent console pairs a host again. Verify: `pnpm exec openspec validate architecture-ai-native-resources-in-product-assistant --strict --no-interactive` reports the change valid, and its tasks are complete.

## 2. The surface check

- [ ] 2.1 Add the check over every resource type, with no roster: each type's content schema describes as a root object, and its undescribed and read-only paths match the record kept per type, so a partial surface is never silent. Verify: a test named after the scenario 'A type whose content schema is not an object fails CI', failing first, then passing; and the scenario 'A change to a type's described surface fails CI until it is recorded'.
