# Store Action Inputs

Read when writing a store action's parameters.

- **Pass the full tRPC input object, never split it.** Store action params mirror the tRPC input type directly — never pull a shared field (`parentId`) out as a separate argument with `Except<Input, "parentId">` for the rest. Call sites pass the whole object inline: `await createFoo({ parentId, id: selectedFoo.value.id, bars: pendingBars.value })`.
- **Minimal input** — params are the minimum required (typically just an id); the full entity comes from the **API response**, not the caller. Design tRPC mutations to return the affected entity when the store needs it for local state.
