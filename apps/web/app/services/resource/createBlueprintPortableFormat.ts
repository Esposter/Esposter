// @unocss-include
import type { PortableFormat } from "#src/models/resource/PortableFormat";

import { MimeType } from "#shared/models/file/MimeType";
import { JSON_FILE_ACCEPT } from "#src/services/file/constants";
import { importFile } from "#src/services/file/importFile";
import { validateFileWithAlert } from "#src/services/file/validateFileWithAlert";
import { parseBlueprintManifest } from "#src/services/resource/blueprint/parseBlueprintManifest";
import { stringifyBlueprintManifest } from "#src/services/resource/blueprint/stringifyBlueprintManifest";
import { useBlueprintStore } from "#src/store/resource/blueprint/index";
import { useResourceStore } from "#src/store/resource/index";
import { useVersionHistoryStore } from "#src/store/resource/versionHistory";
import { trimFileExtension } from "#src/util/file/trimFileExtension";
import { downloadFile } from "@esposter/shared";

// A blueprint's manifest as a JSON file. Export downloads the saved manifest, named after the blueprint, so the file is
// What a deploy would create. Import reads a file the manifest schema accepts into the Editor as unsaved text, which
// Only Save makes the saved manifest
export const createBlueprintPortableFormat = (): PortableFormat => ({
  export: async () => {
    const resourceStore = useResourceStore();
    const { currentResourceId, resource } = storeToRefs(resourceStore);
    const resourceId = currentResourceId.value;
    const blueprintStore = useBlueprintStore();
    const { loadContent } = blueprintStore;
    await loadContent();
    if (currentResourceId.value !== resourceId || !resource.value) return;

    const { blueprint } = storeToRefs(blueprintStore);
    downloadFile(
      `${trimFileExtension(resource.value.name)}.json`,
      stringifyBlueprintManifest(blueprint.value),
      MimeType.Json,
    );
  },
  icon: "i-mdi:code-json",
  import: async () => {
    const resourceStore = useResourceStore();
    const { captureOpeningCheck } = resourceStore;
    // The opening the import was picked under, so a file read after the same resource was closed and reopened lands
    // Nowhere
    const isStillOpen = captureOpeningCheck();
    const blueprintStore = useBlueprintStore();
    const { loadContent, setManifestJson } = blueprintStore;
    await loadContent();
    const versionHistoryStore = useVersionHistoryStore();
    const { saveResourceRevision } = versionHistoryStore;
    await importFile(MimeType.Json, JSON_FILE_ACCEPT, async (file) => {
      // A file over the app's file limit is refused before it is read, so no text is replaced for it
      if (!validateFileWithAlert(file)) return;

      const manifest = parseBlueprintManifest(await file.text());
      // A file read after the owner moved to another resource, or reopened this one, is an import for the opening it
      // Was Picked under, and must not fill the one open now
      if (!isStillOpen()) return;
      // The safety net an import takes before it replaces the draft, so the saved manifest it replaces stays in version
      // History whenever the owner saves the import. A failed revision leaves the Editor's text as it was
      if (!(await saveResourceRevision())) return;

      setManifestJson(manifest);
    });
  },
  label: "JSON",
});
