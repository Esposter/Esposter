import type { PinnedTool } from "#src/models/shared/PinnedTool";

import { PINNED_TOOL_MAX_BYTES } from "#src/services/shared/constants";
import { fetchOk } from "#src/services/shared/fetchOk";
import { findExecutable } from "#src/services/shared/findExecutable";
import { getSystemTarPath } from "#src/services/shared/getSystemTarPath";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { execFileSync } from "@esposter/shared-node/child-process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

// Fetched and unpacked into a partial folder of the attempt's own renamed onto the tool's, so a write or an unpack cut
// Short is never found as the tool and no other attempt's files are ever removed. The rename is refused while the tool's
// Folder holds anything, so one another process has published is never removed but kept; one without the executable
// Holds only a stale attempt, and is moved aside under a name of its own and removed before the rename is made again
export const installPinnedTool = async ({
  archiveSha256,
  archiveUrl,
  directory,
  downloadTimeoutMs,
  executablePattern,
  isArchive,
}: PinnedTool): Promise<string> => {
  const archive = await fetchOk(archiveUrl, { maxBytes: PINNED_TOOL_MAX_BYTES, timeoutMs: downloadTimeoutMs });
  const checksum = createHash("sha256").update(archive).digest("hex");
  if (checksum !== archiveSha256)
    throw new InvalidOperationError(Operation.Read, archiveUrl, `has checksum ${checksum}, not the pinned one`);
  await mkdir(dirname(directory), { recursive: true });
  const partialDirectory = await mkdtemp(`${directory}.partial-`);
  if (isArchive) {
    const archivePath = join(partialDirectory, "archive");
    await writeFile(archivePath, archive);
    // The system's tar reads a zip or a tar.xz by its contents on Windows and macOS, so the file's name says nothing to it
    execFileSync(getSystemTarPath(), ["-xf", archivePath, "-C", partialDirectory]);
    await rm(archivePath);
  } else await writeFile(join(partialDirectory, executablePattern), archive);
  const isPublished = await getResultAsync(() => rename(partialDirectory, directory)).match(
    () => true,
    // A rename that fails is a directory another run published first, which the check below takes over
    () => false,
  );
  if (!isPublished) {
    const installed = findExecutable(directory, executablePattern);
    if (installed) {
      await rm(partialDirectory, { force: true, recursive: true });
      return installed;
    }
    const staleDirectory = await mkdtemp(`${directory}.stale-`);
    await rename(directory, join(staleDirectory, basename(directory)));
    await rm(staleDirectory, { force: true, recursive: true });
    await rename(partialDirectory, directory);
  }
  const unpacked = findExecutable(directory, executablePattern);
  if (!unpacked) throw new InvalidOperationError(Operation.Read, archiveUrl, `unpacked no ${executablePattern}`);
  return unpacked;
};
