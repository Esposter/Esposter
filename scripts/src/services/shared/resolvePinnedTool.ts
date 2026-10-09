import type { PinnedTool } from "#src/models/shared/PinnedTool";

import { fetchOk } from "#src/services/shared/fetchOk";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { globSync } from "node:fs";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

// A pinned tool's executable: fetched, checked against its checksum and unpacked the first time it is needed, and found
// In its folder after that. A bare executable is the download itself, kept under the name its pattern names
export const resolvePinnedTool = async ({
  archiveSha256,
  archiveUrl,
  directory,
  downloadTimeoutMs,
  executablePattern,
  isArchive,
}: PinnedTool): Promise<string> => {
  const [held] = globSync(executablePattern, { cwd: directory });
  if (held) return join(directory, held);
  const response = await fetchOk(archiveUrl, { timeoutMs: downloadTimeoutMs });
  const archive = new Uint8Array(await response.arrayBuffer());
  const checksum = createHash("sha256").update(archive).digest("hex");
  if (checksum !== archiveSha256)
    throw new InvalidOperationError(Operation.Read, archiveUrl, `has checksum ${checksum}, not the pinned one`);
  // Fetched and unpacked into a partial folder renamed onto its own, so a write or an unpack cut short is never found
  // As the tool. A folder left without the executable holds only such a stale attempt, and is replaced
  const partialDirectory = `${directory}.partial`;
  await rm(partialDirectory, { force: true, recursive: true });
  await mkdir(partialDirectory, { recursive: true });
  if (isArchive) {
    const archivePath = join(partialDirectory, "archive.zip");
    await writeFile(archivePath, archive);
    // Windows' own tar unpacks a zip; elsewhere the tar on the PATH does, as bsdtar and GNU tar both read one
    const tarPath = process.env.SystemRoot ? join(process.env.SystemRoot, "System32", "tar.exe") : "tar";
    execFileSync(tarPath, ["-xf", archivePath, "-C", partialDirectory]);
    await rm(archivePath);
  } else await writeFile(join(partialDirectory, executablePattern), archive);
  await rm(directory, { force: true, recursive: true });
  await rename(partialDirectory, directory);
  const [unpacked] = globSync(executablePattern, { cwd: directory });
  if (!unpacked) throw new InvalidOperationError(Operation.Read, archiveUrl, `unpacked no ${executablePattern}`);
  return join(directory, unpacked);
};
