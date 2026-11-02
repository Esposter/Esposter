# Whiteboard published view

A read-only whiteboard for anyone with its published link: the canvas drawn as the owner left it, with pan and zoom, and no editing, no palette, no toolbar and no minimap.

## Why deferred

The whiteboard declares no publish capability, so it has no publish copy and no published view. Publishing is a per-type opt-in: the type declares `publishable: true` in `ResourceDefinitionMap` and provides a view component in `ViewComponentMap`, and the shared public page dispatches to it ([publishing](../../../specs/architecture/publishing/design.md)). The public route already exists, so the work is the whiteboard's own publish copy, its read-only view and the opt-in, and none of it is needed while the owner only shares inside the app.

## Revisit when

An owner asks to share a whiteboard with people who are not logged in. Until then the published view has no caller, and the editor is the whiteboard's only view ([whiteboard](../../../specs/resource/whiteboard/design.md)).
