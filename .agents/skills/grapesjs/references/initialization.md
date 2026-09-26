# Initializing an Editor

Read when an editor component creates its GrapesJS instance, its storage adapter or its asset upload.

Never call `grapesJS.init` in a component. `useGrapesJsEditor(type, storage, configuration?, assets?)` (`app/composables/grapesjs/useGrapesJsEditor.ts`) owns the shared scaffolding: container (`#${GRAPES_JS_EDITOR_CONTAINER_ID}` from `app/services/grapesjs/constants.ts`), `fromElement`, `height: 100%`, the `document` storage manager, session-change re-init, and unmount cleanup (watcher stop + `editor.destroy()`). `type` is the resource type, which it registers with `useAdoptResourceContent` so a restore reloads the live project instead of letting the next autosave write the pre-restore one back. It returns `{ editor: ShallowRef<Editor | undefined> }` and is `async` (awaits the SSR-aware session) — `await` it in the editor component's setup.

- The component template gives GrapesJS its own `<div :id="GRAPES_JS_EDITOR_CONTAINER_ID" flex-1 of-hidden />`; it must never mount on a container that also holds a toolbar (it would ingest it via `fromElement`).
- `storage.load`/`storage.store` delegate to the product store (`readEmailEditor`/`saveEmailEditor`, …). `store` receives `(data, editor)` so save can capture editor-derived values.
- `assets` is the FileAssets upload adapter (`{ upload: (file) => Promise<string> }`). Pass it — without it GrapesJS embeds dropped images as base64 into the content blob. Build it from `useUploadResourceFile(type, () => resource?.id ?? "")`, reading `resource` from `useResourceStore`; the composable owns the Asset Manager `uploadFile` handler, size validation and error alerts.
