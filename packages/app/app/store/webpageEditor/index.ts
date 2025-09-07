import type { ProjectData } from "grapesjs";

import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { saveItemMetadata } from "@/services/shared/metadata/saveItemMetadata";

export const useWebpageEditorStore = defineStore("webpageEditor", () => {
  const { $trpc } = useNuxtApp();
  const readWebpageEditor = () => $trpc.webpageEditor.readWebpageEditor.query();
  const saveWebpageEditor = async (projectData: ProjectData) => {
    const webpageEditor = new WebpageEditor(projectData);
    saveItemMetadata(webpageEditor);
    await $trpc.webpageEditor.saveWebpageEditor.mutate(webpageEditor);
  };
  return { readWebpageEditor, saveWebpageEditor };
});
