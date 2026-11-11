# Whiteboard published view

A read-only view of a whiteboard for anyone with its published link: the document drawn as its owner left it, every element in its stacking order, with pan and zoom to move around it, and no editing, palette or toolbar.

## Why deferred

The whiteboard declares no publish capability, so it has no publish copy and no published view. Publishing is a per-type opt-in: the type declares `publishable: true` in `ResourceDefinitionMap` and provides a view component in `ViewComponentMap`, and the shared public page dispatches to it ([publishing](../../../specs/architecture/publishing/design.md)). The public route already exists, so the work is the whiteboard's own publish copy, its read-only view and the opt-in, and none of it is needed while the owner only shares inside the app. A read-only switch inside the owner's own editor is the same view by another route, since the editor already shows the board, so this is the one record for any read-only whiteboard.

## Revisit when

An owner asks to share a whiteboard with people who are not logged in. Until then the published view has no caller, and the editor is the whiteboard's only view ([whiteboard](../../../specs/resource/whiteboard/design.md)).
