# Email canvas drawing per node type

## Why

The design canvas draws most of an email's node types as a generic box labelled with the node's type name. A button reads `mj-button` where its words belong, a navbar's links read `mj-navbar-link`, and a starter email, which is meant to show every part an email can hold, reads as a stack of type names. The [email page builder](../../../specs/resource/page-builder/email/design.md) already promises that each email type is drawn with its own canvas component, so the gap is a broken promise, not a new feature.

## What changes

- Every MJML node type gets its own canvas drawing, chosen from one table keyed by node type. The table is typed so that a node type with no drawing is a compile error, not a silent fallback to a type-name box.
- A button and a navbar link draw their words.
- The starter email draws each of its parts with its own content.
- The generic type-name box stays only as the drawing of types whose content the canvas does not show (for example, a social icon row), and each such type is named in the table rather than reached by a fallback.

## Out of scope

The preview's request size and the frame's console and scrolling problems are separate changes: [resource-email-preview-transport](../../resource-email-preview-transport/proposal.md) and [resource-email-canvas-frame](../../resource-email-canvas-frame/proposal.md).
