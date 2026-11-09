# Reusable Blocks

Saved blocks, called symbols in GrapesJS, that an author places many times and edits once. It covers the email row "Saved, reusable blocks (symbols)" and the webpage row "Saved, reusable blocks (symbols)". GrapesJS keeps each symbol as one definition that every placed instance follows. Neither of our editors holds such a definition.

## Why deferred

Each node in an editor's document is a type and its own props, and the publish render reads each node from those props ([document model](../../../specs/resource/page-builder/document-model/design.md)). A symbol is one definition with many instances that follow it, so an instance would need a reference to a definition the document does not hold, and the publish render would need to resolve that reference. The page builder's program design marked GrapesJS's symbols module unused when it replaced the engine ([page builder program](../../../changes/archive/2026-11-05-resource-page-builder-program/design.md)). A symbol would add a definitions store to the document, a reference type for an instance, and a rule for which props an instance may override.

**Revisit when:** the document model's design names a shared definition, how an instance resolves to it at publish, and which props an instance may override.
