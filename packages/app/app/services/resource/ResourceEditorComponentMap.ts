import { ResourceType } from "@esposter/db-schema";
// The component rendered inside the built-in Editor blade; blade-only types (Program/Sheet/TodoList) have no entry,
// So their nav skips the Editor blade entirely.
// Loaded on demand rather than imported: these carry the heaviest vendors in the app — grapesjs behind Email and
// Webpage, vue-flow behind Flowchart, tiptap behind Note, the survey creator behind Survey — and a static map
// Puts every one of them in the chunk of whoever reads the map, so opening a note downloads all the other
// Canvases too. The blade renders each inside a Suspense that already shows a skeleton while one arrives
export const ResourceEditorComponentMap: Partial<Record<ResourceType, Component>> = {
  [ResourceType.Blueprint]: defineAsyncComponent(() => import("@/components/Resource/Blueprint/Editor.vue")),
  [ResourceType.Dashboard]: defineAsyncComponent(() => import("@/components/Resource/Dashboard/Editor.vue")),
  [ResourceType.Email]: defineAsyncComponent(() => import("@/components/Resource/Email/Editor.vue")),
  [ResourceType.Flowchart]: defineAsyncComponent(() => import("@/components/Resource/Flowchart/Editor.vue")),
  [ResourceType.Note]: defineAsyncComponent(() => import("@/components/Resource/Note/Editor.vue")),
  [ResourceType.Survey]: defineAsyncComponent(() => import("@/components/Resource/Survey/Editor.vue")),
  [ResourceType.Webpage]: defineAsyncComponent(() => import("@/components/Resource/Webpage/Editor.vue")),
};
