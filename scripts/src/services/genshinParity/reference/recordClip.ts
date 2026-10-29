import { packPathObject } from "#src/services/genshinParity/reference/packPathObject";
import { readManifestFile } from "#src/services/genshinParity/reference/readManifestFile";
import { writeManifestFile } from "#src/services/genshinParity/reference/writeManifestFile";
import { basename } from "node:path";

// Writes a downloaded clip into the manifest as a recording row, which a restore prints the clip command for. Its hash
// and size are read from the file; its public url and the seconds it was cut from come from the download
export const recordClip = async (path: string, url: string, range: { end: number; start: number }): Promise<void> => {
  const { bytes, extension, sha256 } = await packPathObject(path);
  const name = basename(path);
  const manifest = await readManifestFile();
  const existing = manifest.recordings.find((row) => row.name === name);
  await writeManifestFile({
    ...manifest,
    recordings: [
      ...manifest.recordings.filter((row) => row.name !== name),
      { attribution: existing?.attribution ?? {}, bytes, name, range, sha256, source: url, sourceFormat: extension },
    ],
  });
};
