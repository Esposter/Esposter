# Resource Resolution

Read when an editor needs its resource or its content, or a content class is rebuilt from project data.

An editor never picks its own resource and holds no `currentDocument` of its own. The editor stores (`app/store/emailEditor/`, `app/store/webpageEditor/`) hold only their own content and take the row from `useResourceStore`, which resolves it from the route:

```ts
const resourceStore = useResourceStore();
const { readContent, readResource, saveContent } = resourceStore;
```

The editor stores are built on `createContentData` like every other content store, so the storage adapter's `load` serves the routed resource's content — read once per open resource, re-read on a restore — with no manual `editor.load()` re-pull watcher. Picking/publishing is the Resource Explorer's job; the only in-editor picker is `DatasetReferencePicker` in `Resource/Email/Editor.vue`'s toolbar, shown when a session exists.

**The load seeds `setPersistedContent`**, through `createContentData` like every other content store — and these
two depend on it, because GrapesJS stores as soon as it finishes loading. `useResourceStore` owns why
(`app/store/resource/index.ts`).

**Rebuild the content class from the project data plus the loaded row's own metadata, never from the project
data alone.** GrapesJS project data carries only GrapesJS's own keys, so a content class constructed from it
re-runs its field initializers: a fresh identity, and a fresh dirty-check shape, on every autosave tick. Both
editor stores spread `getItemMetadata(content.value)` (and Email its `datasetReference`) over it on the way in.
