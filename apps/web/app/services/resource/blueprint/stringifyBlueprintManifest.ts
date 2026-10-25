import type { BlueprintResource } from "#shared/models/resource/blueprint/BlueprintResource";

// The manifest as the Editor shows it and as its file holds it, so an export, an import and the Editor's text agree
export const stringifyBlueprintManifest = (manifest: BlueprintResource) => JSON.stringify(manifest, null, 2);
