import type { ProjectData } from "grapesjs";

import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";

export const useWebpageEditorStore = defineStore("webpageEditor", () => {
  const { $trpc } = useNuxtApp();
  const webpageEditor = ref(new WebpageEditor());
  const save = useSave(webpageEditor, { auth: { save: $trpc.webpageEditor.saveWebpageEditor.mutate } });
  const readWebpageEditor = () => $trpc.webpageEditor.readWebpageEditor.query();
  const saveWebpageEditor = async (projectData: ProjectData) => {
    webpageEditor.value = new WebpageEditor(projectData);
    await save();
  };
  return { readWebpageEditor, saveWebpageEditor };
});
