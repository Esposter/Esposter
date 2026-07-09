import type { ProjectData } from "grapesjs";

import { WebpageEditor, webpageEditorSchema } from "#shared/models/webpageEditor/data/WebpageEditor";
import { authClient } from "@/services/auth/authClient";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { MAX_READ_LIMIT } from "@esposter/shared";

export const useWebpageEditorStore = defineStore("webpageEditor", () => {
  const { $trpc } = useNuxtApp();
  const session = authClient.useSession();
  const {
    content,
    createResource,
    currentResource,
    deleteResource,
    load,
    loadLocal,
    publication,
    publish: publishWebpage,
    renameResource,
    resources,
    save,
    selectResource,
    unpublish: unpublishWebpage,
  } = useResourceState(
    WebpageEditor,
    {
      createResource: (input) => $trpc.webpageEditor.createResource.mutate(input),
      deleteResource: (input) => $trpc.webpageEditor.deleteResource.mutate(input),
      publishResource: (input) => $trpc.webpageEditor.publishResource.mutate(input),
      readResourceContent: (input) => $trpc.webpageEditor.readResourceContent.query(input),
      readResourcePublication: (input) => $trpc.webpageEditor.readResourcePublication.query(input),
      readResources: async () => (await $trpc.webpageEditor.readResources.query({ limit: MAX_READ_LIMIT })).items,
      saveResourceContent: (input) => $trpc.webpageEditor.saveResourceContent.mutate(input),
      unpublishResource: (input) => $trpc.webpageEditor.unpublishResource.mutate(input),
      updateResource: (input) => $trpc.webpageEditor.updateResource.mutate(input),
    },
    { defaultName: "My Webpage", localStorageKey: LocalStorageKey.WebpageEditorStore, schema: webpageEditorSchema },
  );
  // The resource list load happens once; subsequent editor storage loads serve the selected resource's content
  const readWebpageEditor = async () => {
    if (session.value.data) {
      if (!currentResource.value) await load();
    } else loadLocal();
    return content.value;
  };
  const saveWebpageEditor = async (projectData: ProjectData, { css, html }: Pick<WebpageEditor, "css" | "html">) => {
    content.value = new WebpageEditor({ ...projectData, css, html });
    await save();
  };
  return {
    createResource,
    currentResource,
    deleteResource,
    publication,
    publishWebpage,
    readWebpageEditor,
    renameResource,
    resources,
    saveWebpageEditor,
    selectResource,
    unpublishWebpage,
  };
});
