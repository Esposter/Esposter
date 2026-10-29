import type { PublicRecordingBackfill } from "#src/models/genshinParity/reference/PublicRecordingBackfill";
import type { PublicRecordingName } from "#src/models/genshinParity/reference/PublicRecordingName";

import { CAPTURES_DIRECTORY } from "#src/services/genshinParity/game/constants";
import { REFERENCE_PACK_CONCURRENCY } from "#src/services/genshinParity/reference/constants";
import { createPublicRecordingRow } from "#src/services/genshinParity/reference/createPublicRecordingRow";
import { packPathObject } from "#src/services/genshinParity/reference/packPathObject";
import { parsePublicRecordingName } from "#src/services/genshinParity/reference/parsePublicRecordingName";
import { readManifestFile } from "#src/services/genshinParity/reference/readManifestFile";
import { writeManifestFile } from "#src/services/genshinParity/reference/writeManifestFile";
import { settleAll } from "@esposter/shared";
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

// Adds a recording row for each public recording in the captures folder that has none, named by its file name. Its bytes
// are not uploaded: a restore fetches it again from its public page. A row already there wins, even when the file's hash
// differs, since two machines' copies of one public video are never byte-identical, so that is reported and not a collision.
// A dry run plans the same rows and writes nothing
export const backfillPublicRecordings = async (isDryRun: boolean): Promise<PublicRecordingBackfill> => {
  const fileNames = existsSync(CAPTURES_DIRECTORY) ? await readdir(CAPTURES_DIRECTORY) : [];
  const publicFiles: { fileName: string; recording: PublicRecordingName }[] = [];
  const skipped: string[] = [];
  for (const fileName of fileNames) {
    const recording = parsePublicRecordingName(fileName);
    if (recording === undefined) skipped.push(fileName);
    else publicFiles.push({ fileName, recording });
  }
  const manifest = await readManifestFile();
  const heldRows = new Map(manifest.recordings.map((row) => [row.name, row]));
  const rows = await settleAll(
    publicFiles.map(({ fileName, recording: { id, site } }) => async () => {
      const { bytes, extension, sha256 } = await packPathObject(join(CAPTURES_DIRECTORY, fileName));
      return createPublicRecordingRow({ bytes, id, name: fileName, sha256, site, sourceFormat: extension });
    }),
    REFERENCE_PACK_CONCURRENCY,
  );
  const added = rows.filter(({ name }) => !heldRows.has(name));
  const differing = rows.flatMap((row) => {
    const held = heldRows.get(row.name);
    return held !== undefined && held.sha256 !== row.sha256 ? [row.name] : [];
  });
  if (!isDryRun && added.length > 0)
    await writeManifestFile({ ...manifest, recordings: [...manifest.recordings, ...added] });
  return { added, alreadyHeld: rows.length - added.length, differing, skipped };
};
