import type { SubCommandsDef } from "citty";

import { CAPTURES_DIRECTORY } from "#src/services/genshinParity/game/constants";
import { parsePublicRecordingName } from "#src/services/genshinParity/reference/parsePublicRecordingName";
import { readManifestFile } from "#src/services/genshinParity/reference/readManifestFile";
import { restoreManifestFiles } from "#src/services/genshinParity/reference/restoreManifestFiles";
import { defineCommand } from "citty";

export const referencesRestoreCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Fetch every record the manifest names into its place in the parity folder, checking each hash, and print the clip command for each public recording; what a fresh machine runs",
    name: "restore",
  },
  run: async () => {
    const manifest = await readManifestFile();
    const { fetched, held } = await restoreManifestFiles(manifest);
    console.log(`fetched ${fetched} records (${held} already held)`);
    // A recording is not stored, so each is printed as the clip to run for it: its range when its row names one
    for (const { name, range, source } of manifest.recordings)
      console.log(
        `next  recreation clip --directory ${CAPTURES_DIRECTORY} ${source} --from ${range?.start ?? "<from>"} --to ${range?.end ?? "<to>"} --name ${parsePublicRecordingName(name)?.name ?? name}`,
      );
  },
});
