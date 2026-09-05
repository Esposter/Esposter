import type { ResourceType } from "@esposter/db-schema";
import type { ProjectData } from "grapesjs";

import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { getItemMetadata } from "@/services/entity/getItemMetadata";
import { useResourceStore } from "@/store/resource";

export const useWebpageEditorStore = defineStore("webpageEditor", () => {
  const resourceStore = useResourceStore();
  const { readContent, readResource, saveContent, setPersistedContent } = resourceStore;
  // GrapesJS owns the live project once it has loaded, so the content is held plainly rather than reactively —
  // Nothing outside the two adapter callbacks reads it
  let content = new WebpageEditor();
  const readWebpageEditor = async () => {
    await readResource();
    content = new WebpageEditor(await readContent<ResourceType.Webpage>());
    setPersistedContent(content);
    return content;
  };
  // The standalone render (css/html) is captured at save time so the published webpage serves without GrapesJS,
  // And the loaded content's own metadata is carried across so a save doesn't mint a fresh content identity
  const saveWebpageEditor = (projectData: ProjectData, { css, html }: Pick<WebpageEditor, "css" | "html">) => {
    content = new WebpageEditor({ ...projectData, ...getItemMetadata(content), css, html });
    // The save status is handed back rather than swallowed, the same as every other content store. It is not
    // Turned into a throw: GrapesJS only reads a rejection as a failed store, and the writes that answer false
    // Are mostly benign skips (nothing loaded, a resource swapped mid-save) whose one real case, a stale
    // Version, already raises its own refresh notification
    return saveContent(content);
  };
  return { readWebpageEditor, saveWebpageEditor };
});
