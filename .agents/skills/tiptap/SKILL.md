---
name: tiptap
description: Apply when writing or modifying Tiptap extensions, suggestion lists, or editor composables. Esposter's Tiptap/ProseMirror conventions for the message editor and its suggestions.
---

# Tiptap Conventions

## Suggestion Extensions

Every suggestion config declares a unique `PluginKey`, a plugin-only extension is `createSuggestionExtension`, an extension that reads state lives in a `use*Extension` composable and one that reads none is a module constant (never in a component), ProseMirror comes through `@tiptap/pm/*`, and trigger characters are `SuggestionTrigger` (`references/suggestion-extensions.md`).

## Suggestion lists are drawn by the editor, never mounted on the body

**Rule**: a suggestion's `render` is `getRender(ListComponent)`, which only writes what the plugin reports to the rich-text suggestion store (`apps/web/app/store/richTextEditor/suggestion.ts`). The editor whose caret opened it draws it — `RichTextEditorSuggestions`, inside `RichTextEditor`, in a `UiCaretPopover` at the caret — so the page's theme scope and style reach the list, and positioning is the popover's anchor, never a hand-measured one. A list exposes `onKeyDown` (`useSuggestionListNavigation`), which the store hands the plugin once the list is drawn, so the keys walk it while focus stays in the document. Never `new VueRenderer` and append to `document.body`: nothing above the body carries the theme.

## Wiring extensions into the editor

The feature stack a composer shares — keyboard shortcuts, code block, emoji, custom emoji, spoiler, mention — is built once in `useComposer` (`apps/web/app/composables/message/composer/useComposer.ts`), as a plain array. Every entry but the keyboard shortcuts is a module constant under `apps/web/app/services/message/`; the keyboard shortcuts are a `use*Extension()` call, since they read the message store and the session. `apps/web/app/components/Message/Model/Message/Input/Composer.vue` spreads that array, with its `extraExtensions`, into the editor's `:extensions`; the room composer (`apps/web/app/components/Message/Model/Message/Input/Index.vue`) passes the slash-command extension in as one of those, since it is the room's alone:

```ts
const extraExtensions = [SlashCommandExtension];
```

```html
:extra-extensions="extraExtensions"
```

`RichTextEditor` owns only the always-on extensions (`StarterKit`, `CharacterCount`, `Placeholder`, `FileHandler`, `useLinkClickExtension`); feature extensions come via the `:extensions` prop.

## An editor is typed as `@tiptap/core`'s `Editor`

Every tiptap callback (`onCreate`, `onUpdate`, an extension's hooks) hands over the core `Editor`, and `@tiptap/vue-3`'s extends it, so a prop, parameter or store field names the core one and either instance passes with no cast. `no-restricted-imports` refuses `Editor` from `@tiptap/vue-3`.

## `useEditor` owns the editor's lifecycle — never register a second teardown

`useEditor` constructs the editor in `onMounted` (so a component that `await`s its content in setup is already
seeded by then) and destroys it in its own `onBeforeUnmount`. A component adding an `onBeforeUnmount` of its own
that calls `editor.destroy()` tears the same editor down twice — harmless today and a double-free the moment
Tiptap's teardown stops being idempotent. Nothing about the editor's lifetime belongs in the calling component.

## A document renders to HTML through the static renderer

`renderToHTMLString` from `@tiptap/static-renderer/pm/html-string` renders a document from the schema's output specs with no DOM, so the same call works in the browser, in Node and in the web Worker. `@tiptap/html`'s `generateHTML` and `getHTMLFromFragment` are a `no-restricted-syntax` error: a Worker resolves that package's browser build, which throws where `window` is absent, while a Node test resolves its happy-dom build and passes. Its `generateJSON` stays for parsing pasted or imported HTML, which only the browser does.

## Reference pages

- `references/suggestion-extensions.md` — when adding or changing a suggestion or custom extension.
