# Mounting an Editor

Read when an editor component mounts the page builder, or wires its document to autosave.

The editor component mounts `<PageBuilderEditor :kind :resource-id />` with the kind for its resource type (`webpageKind` for a webpage, `emailKind` for an email), as `apps/web/app/components/Resource/Webpage/Editor.vue` does. It never creates a canvas, a frame or a GrapesJS instance of its own.

- The component awaits the content store's `loadContent()` in setup, so the document is loaded before the builder renders.
- Autosave is driven by the document, not by the component: `watchAutosave(computed(() => getDocument(resourceId)), () => saveWebpage(resourceId))` (`apps/web/app/store/pageBuilder/document.ts`) saves on the content store's own cadence whenever the document changes deeply. The document itself is read from `usePageBuilderDocumentStore().getDocument` (`apps/web/app/store/pageBuilder/document.ts`).
- The resource row comes from `useResourceStore`; an editor never picks its own resource (see `references/resource-resolution.md`).
