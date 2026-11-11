# Note page mentions

Typing `@` in a note to link to another resource, drawn as an inline link to it, as Notion's page mention does.

## Why deferred

A mention is a reference from one resource to another, and the platform keeps an index of those, read by the delete warning ([resource links](../../../specs/architecture/resource-links/design.md)). A mention would add a role to that index, written by the note's save from the mention nodes in its document, and a node, a picker and a sanitized render beside it. A text mention is a link the owner can already paste, and it does not dangle quietly the way a stored one would without the index.

## Revisit when

An owner asks to link a note to another resource from inside the text, and a pasted link no longer does.
