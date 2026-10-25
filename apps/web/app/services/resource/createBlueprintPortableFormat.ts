// @unocss-include
import type { PortableFormat } from "@/models/resource/PortableFormat";

import { MimeType } from "#shared/models/file/MimeType";
import { parseBlueprintManifest } from "@/services/resource/blueprint/parseBlueprintManifest";
import { stringifyBlueprintManifest } from "@/services/resource/blueprint/stringifyBlueprintManifest";
import { BLUEPRINT_MANIFEST_ACCEPT } from "@/services/resource/constants";
import { useResourceStore } from "@/store/resource";
import { useBlueprintStore } from "@/store/resource/blueprint";
import { useVersionHistoryStore } from "@/store/resource/versionHistory";
import { trimFileExtension } from "@/util/file/trimFileExtension";
import { downloadFile } from "@esposter/shared";

// A blueprint's manifest as a JSON file. Export downloads the saved manifest, named after the blueprint, so the file is
// What a deploy would create. Import reads a file the manifest schema accepts into the Editor as unsaved text, which
// Only Save makes the saved manifest
export const createBlueprintPortableFormat = (): PortableFormat => ({
  export: async () => {
    const resourceStore = useResourceStore();
    const resourceId = resourceStore.currentResourceId;
    const blueprintStore = useBlueprintStore();
    const { loadContent } = blueprintStore;
    await loadContent();
    if (resourceStore.currentResourceId !== resourceId || !resourceStore.resource) return;

    const { blueprint } = storeToRefs(blueprintStore);
    downloadFile(
      `${trimFileExtension(resourceStore.resource.name)}.json`,
      stringifyBlueprintManifest(blueprint.value),
      MimeType.Json,
    );
  },
  icon: "i-mdi:code-json",
  import: async () => {
    const resourceStore = useResourceStore();
    const resourceId = resourceStore.currentResourceId;
    const blueprintStore = useBlueprintStore();
    const { loadContent, setManifestJson } = blueprintStore;
    await loadContent();
    const versionHistoryStore = useVersionHistoryStore();
    const { saveResourceRevision } = versionHistoryStore;
    const importFile = useImportFile();
    const validateFile = useValidateFile();
    await importFile(MimeType.Json, BLUEPRINT_MANIFEST_ACCEPT, async (file) => {
      // A file over the app's file limit is refused before it is read, so no text is replaced for it
      if (!validateFile(file)) return;

      const manifest = parseBlueprintManifest(await file.text());
      // A file read after the owner moved to another resource is that resource's import, and must not fill this one
      if (resourceStore.currentResourceId !== resourceId) return;
      // The safety net an import takes before it replaces the draft, so the saved manifest it replaces stays in version
      // History whenever the owner saves the import. A failed revision leaves the Editor's text as it was
      if (!(await saveResourceRevision())) return;

      setManifestJson(manifest);
    });
  },
  label: "JSON",
});
