## Why

A webpage button can only open its link in the same tab, and no webpage node takes an element id. A page cannot link to one of its own sections, since nothing lets the author name the section. The email's button already holds a target and a relationship, so the webpage is behind its own sibling on the same control.

## What Changes

- A webpage button chooses the same tab or a new tab, and a new-tab link always carries the relationship that keeps the new page from reaching back.
- Every webpage node takes an element id, which its published element carries.
- The document refuses an element id that does not take a node id's characters and length, and two nodes that share an element id.
- The Content panel edits the new-tab choice and the element id.

## Capabilities

### Modified Capabilities

- `resource/page-builder/document-model`: a button's target, and every node's element id, are stored and published, and the document refuses an invalid or repeated id.
- `resource/page-builder/canvas`: the Content panel edits the new fields.

## Impact

The button's props gain a target choice, and every webpage node's props gain an element id. The render writes it onto each element. The document's save check gains one rule for ids.
