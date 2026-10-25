import type { BlueprintResource } from "#shared/models/resource/blueprint/BlueprintResource";

import { blueprintResourceSchema } from "#shared/models/resource/blueprint/BlueprintResource";
import { ResourceType } from "@esposter/db-schema";

const EDITOR_ENTRY_TYPES = new Set<ResourceType>([ResourceType.Email, ResourceType.Webpage]);

// The cutover's backfill over one Blueprint's manifest: an Email or Webpage entry keeps no content, so it deploys as a
// Fresh document. Its content was GrapesJS project data, which the new schema refuses. A captured Blueprint entry carries
// Its own manifest as content, so that manifest is walked the same way. Returns a new manifest, leaving the input untouched
export const removeEditorEntryContent = (manifest: BlueprintResource): BlueprintResource => ({
  ...manifest,
  entries: manifest.entries.map((entry) => {
    if (EDITOR_ENTRY_TYPES.has(entry.type)) {
      const { content: _content, ...entryWithoutContent } = entry;
      return entryWithoutContent;
    }
    if (entry.type !== ResourceType.Blueprint) return entry;

    const nestedManifest = blueprintResourceSchema.safeParse(entry.content);
    return nestedManifest.success ? { ...entry, content: removeEditorEntryContent(nestedManifest.data) } : entry;
  }),
});
