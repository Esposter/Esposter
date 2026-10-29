import type { SubCommandsDef } from "citty";

import { CAPTURES_DIRECTORY } from "#src/services/genshinParity/game/constants";
import { formatMebibytes } from "#src/services/genshinParity/reference/formatMebibytes";
import { parsePublicRecordingName } from "#src/services/genshinParity/reference/parsePublicRecordingName";
import { readCachedReference } from "#src/services/genshinParity/reference/readCachedReference";
import { readManifestFile } from "#src/services/genshinParity/reference/readManifestFile";
import { restoreManifestFiles } from "#src/services/genshinParity/reference/restoreManifestFiles";
import { restoreReferences } from "#src/services/genshinParity/reference/restoreReferences";
import { CONTENT_CACHE_DIRECTORY } from "@esposter/shared-node/cache";
import { defineCommand } from "citty";

export const referencesRestoreCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Fetch every image the manifest names into the download cache, and every record into its place, checking each hash; what a fresh machine runs",
    name: "restore",
  },
  run: async () => {
    const manifest = await readManifestFile();
    const { bytes, count } = await restoreReferences(manifest.references, readCachedReference);
    const { fetched, held } = await restoreManifestFiles(manifest);
    console.log(
      `restored ${count} reference images, ${formatMebibytes(bytes)}, into ${CONTENT_CACHE_DIRECTORY}; fetched ${fetched} records (${held} already held)`,
    );
    // A recording is not stored, so each is printed as the clip to run for it: its range when its row names one
    for (const { name, range, source } of manifest.recordings)
      console.log(
        `next  recreation clip --directory ${CAPTURES_DIRECTORY} ${source} --from ${range?.start ?? "<from>"} --to ${range?.end ?? "<to>"} --name ${parsePublicRecordingName(name)?.name ?? name}`,
      );
  },
});
