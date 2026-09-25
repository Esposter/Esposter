import type { ProjectData } from "grapesjs";

import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { getItemMetadata } from "@/services/entity/getItemMetadata";
import { createContentData } from "@/services/resource/createContentData";
import { ResourceType } from "@esposter/db-schema";

export const useWebpageEditorStore = defineStore("webpageEditor", () => {
  const { content, loadContent, saveContent } = createContentData(
    ResourceType.Webpage,
    (data) => new WebpageEditor(data),
  );
  // The editor is rebuilt on every mount of its blade and on a restore, and loads from here each time
  const readWebpageEditor = async () => {
    await loadContent();
    return content.value;
  };
  // The standalone render (css/html) is captured at save time so the published webpage serves without GrapesJS,
  // And the loaded content's own metadata is carried across so a save doesn't mint a fresh content identity
  const saveWebpageEditor = (projectData: ProjectData, { css, html }: Pick<WebpageEditor, "css" | "html">) => {
    content.value = new WebpageEditor({ ...projectData, ...getItemMetadata(content.value), css, html });
    // The save status is handed back rather than swallowed, the same as every other content store. It is not
    // Turned into a throw: GrapesJS only reads a rejection as a failed store, and the writes that answer false
    // Are mostly benign skips (nothing loaded, a resource swapped mid-save) whose one real case, a stale
    // Version, already raises its own refresh notification
    return saveContent();
  };
  return { readWebpageEditor, saveWebpageEditor };
});
