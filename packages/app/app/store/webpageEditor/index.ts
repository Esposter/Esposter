import type { ResourceType } from "@esposter/db-schema";
import type { ProjectData } from "grapesjs";

import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { getRouteParamString } from "@/util/router/getRouteParamString";

export const useWebpageEditorStore = defineStore("webpageEditor", () => {
  const route = useRoute();
  const { load, readContent, resource, save } = useResource<ResourceType.Webpage>(() =>
    getRouteParamString(route.params.id),
  );
  // Cast avoids the excessively deep UnwrapRef instantiation on the nested GrapesJS project types
  const content = ref(new WebpageEditor()) as Ref<WebpageEditor>;
  // GrapesJS storage adapter load: serve the selected resource's content
  const readWebpageEditor = async () => {
    await load();
    const data = await readContent();
    content.value = new WebpageEditor(data ?? undefined);
    return content.value;
  };
  // The standalone render (css/html) is captured at save time so the published webpage serves without GrapesJS
  const saveWebpageEditor = async (projectData: ProjectData, { css, html }: Pick<WebpageEditor, "css" | "html">) => {
    content.value = new WebpageEditor({ ...projectData, css, html });
    await save(content.value);
  };
  return { content, readWebpageEditor, resource, saveWebpageEditor };
});
