import type { ProjectData } from "grapesjs";

import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { saveItemMetadata } from "@/services/shared/saveItemMetadata";

export const useWebpageEditorStore = defineStore("webpageEditor", () => {
  const { $client } = useNuxtApp();
  const readWebpageEditor = () => $client.webpageEditor.readWebpageEditor.query();
  const saveWebpageEditor = async (projectData: ProjectData) => {
    const webpageEditor = Object.assign(new WebpageEditor(), projectData);
    saveItemMetadata(webpageEditor);
    await $client.webpageEditor.saveWebpageEditor.mutate(webpageEditor);
  };
  return { readWebpageEditor, saveWebpageEditor };
});
