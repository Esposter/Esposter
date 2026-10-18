# TipTap Layer Absorption

The app's rich text runs on TipTap, a layer over ProseMirror. The message composer and its edit, the post description and its comments, the todo notes and the Note resource all mount it, and the page builder's text node will too. The idea was to take that layer back, as the [dependency admission](../../../specs/architecture/dependency-admission/design.md) precedent asks: keep the engine and own the layer that decides behaviour. ProseMirror would stay, with its schema, its transactions and steps, its view over `contenteditable`, its input handling for composition and paste, and its history. What would go is TipTap's extension framework, its Vue binding and every TipTap extension the app loads: the starter kit, the table kit, task lists, mention, suggestion, the file handler, the lowlight code block, the character count and the placeholder.

## What it would not be

Rich text does not move onto the [headless block editor](../../../specs/headless-block-editor/editor-core/design.md). The core is a tree of typed blocks edited by JSON Patch, which is the right model for a page's layout and the wrong one for text. Text editing needs a position inside inline content, marks over a run of it, a selection that crosses blocks, steps whose positions map through each other, and an input method's composition. That is ProseMirror's model, and building it on the core would mean writing ProseMirror again. The two meet only where the page builder already joins them: a block whose content is ProseMirror JSON, with ProseMirror mounted inside it.

## Why deferred

- **Nothing it costs us is large.** TipTap is MIT-licensed and maintained, with frequent releases. Its client weight sits in the chunks of the routes that edit text, not in the entry: its core is tens of kilobytes gzipped beside ProseMirror's view of about the same.
- **One upstream workaround.** The editor component re-applies its placeholder and character limit through `setOptions` because TipTap reads extension options once at creation ([ueberdosis/tiptap#1044](https://github.com/ueberdosis/tiptap/issues/1044)), and nothing else in the app works around TipTap.
- **The rewrite is wide and accessibility-shaped.** Every extension the app wrote targets TipTap's extension API: the spoiler mark, the custom emoji node, the mention extension, the link-click plugin, the keyboard shortcuts and the suggestion host behind the emoji, slash and note menus. Each would be rewritten against ProseMirror's plugin and node-view APIs, beside a Vue binding of our own. Focus, composition and mobile keyboards are where the stop list warns that our own version ships worse.

## Revisit when

TipTap stops releasing, or a major release forces a migration across the custom extensions anyway, or a TipTap defect the app meets stays open upstream with no workaround.

## Cheaper interim

TipTap stays as every rich-text surface's layer, and the page builder mounts it inside its text node, as the [page builder](../../../changes/resource-page-builder-program/design.md) program designs.
