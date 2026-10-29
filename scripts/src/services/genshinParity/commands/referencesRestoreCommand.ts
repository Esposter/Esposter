import type { SubCommandsDef } from "citty";

import { formatMebibytes } from "#src/services/genshinParity/reference/formatMebibytes";
import { readCachedReference } from "#src/services/genshinParity/reference/readCachedReference";
import { readManifestFile } from "#src/services/genshinParity/reference/readManifestFile";
import { restoreManifestFiles } from "#src/services/genshinParity/reference/restoreManifestFiles";
import { restoreReferences } from "#src/services/genshinParity/reference/restoreReferences";
import { CONTENT_CACHE_DIRECTORY } from "@esposter/shared-node/cache";
import { defineCommand } from "citty";

export const referencesRestoreCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Fetch every image the manifest names into the download cache, and every recording and record into its place, checking each hash; what a fresh machine runs",
    name: "restore",
  },
  run: async () => {
    const manifest = await readManifestFile();
    const { bytes, count } = await restoreReferences(manifest.references, readCachedReference);
    const { fetched, held } = await restoreManifestFiles(manifest);
    console.log(
      `restored ${count} reference images, ${formatMebibytes(bytes)}, into ${CONTENT_CACHE_DIRECTORY}; fetched ${fetched} recordings and records (${held} already held)`,
    );
  },
});
