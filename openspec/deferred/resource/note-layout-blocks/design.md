# Note Layout Blocks

Beyond text, lists, images and tables, Notion's basic blocks include blocks that shape how a page reads: **toggles** and toggle headings that fold a section away, **callouts** that set a note apart with an icon and a tint, and **columns** that put blocks side by side.

## Why deferred

None of them is in Tiptap's StarterKit, and each needs a custom node designed twice: once as an editor node view and once as the `generateHTML` output the published view sanitizes. A toggle also needs state in the published page, and columns need a drag-to-arrange interaction plus a mobile layout. That is a design and a sanitizer allowance per block. Meanwhile the writing kit, with [images](../../../changes/resource-note-images/design.md) and [tables](../../../specs/resource/note-resource/design.md), already covers the documents a single owner writes. With the [slash menu](../../../specs/resource/note-slash-menu/design.md) shipped, a new block would be one more slash item and one more menu-bar button.

## Revisit when

The slash menu has shipped and someone asks for one of these blocks by name. That one block is proposed on its own, not the set.
