import type { PinnedTool } from "#src/models/shared/PinnedTool";

import { fetchOk } from "#src/services/shared/fetchOk";
import { getResultAsync, InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { globSync } from "node:fs";
import { mkdir, mkdtemp, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

const findExecutable = (directory: string, executablePattern: string): string | undefined => {
  const [held] = globSync(executablePattern, { cwd: directory });
  return held ? join(directory, held) : undefined;
};
// Fetched and unpacked into a partial folder of the attempt's own renamed onto the tool's, so a write or an unpack cut
// Short is never found as the tool and no other attempt's files are ever removed. The rename is refused while the tool's
// Folder holds anything, so one another process has published is never removed but kept; one without the executable
// Holds only a stale attempt, and is moved aside under a name of its own and removed before the rename is made again
const installPinnedTool = async ({
  archiveSha256,
  archiveUrl,
  directory,
  downloadTimeoutMs,
  executablePattern,
  isArchive,
}: PinnedTool): Promise<string> => {
  const response = await fetchOk(archiveUrl, { timeoutMs: downloadTimeoutMs });
  const archive = new Uint8Array(await response.arrayBuffer());
  const checksum = createHash("sha256").update(archive).digest("hex");
  if (checksum !== archiveSha256)
    throw new InvalidOperationError(Operation.Read, archiveUrl, `has checksum ${checksum}, not the pinned one`);
  await mkdir(dirname(directory), { recursive: true });
  const partialDirectory = await mkdtemp(`${directory}.partial-`);
  if (isArchive) {
    const archivePath = join(partialDirectory, "archive.zip");
    await writeFile(archivePath, archive);
    // Windows' own tar unpacks a zip; elsewhere the tar on the PATH does, as bsdtar and GNU tar both read one
    const tarPath = process.env.SystemRoot ? join(process.env.SystemRoot, "System32", "tar.exe") : "tar";
    execFileSync(tarPath, ["-xf", archivePath, "-C", partialDirectory]);
    await rm(archivePath);
  } else await writeFile(join(partialDirectory, executablePattern), archive);
  const isPublished = await getResultAsync(() => rename(partialDirectory, directory)).match(
    () => true,
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
// The one installation of each tool's folder this process runs, which every call finding the folder empty awaits while
// It runs. It is dropped once settled, so a call after a failed one tries again
const installationMap = new Map<string, Promise<string>>();

// A pinned tool's executable: fetched, checked against its checksum and unpacked the first time it is needed, and found
// In its folder after that. A bare executable is the download itself, kept under the name its pattern names
export const resolvePinnedTool = (pinnedTool: PinnedTool): Promise<string> => {
  const { directory, executablePattern } = pinnedTool;
  const held = findExecutable(directory, executablePattern);
  if (held) return Promise.resolve(held);
  let installation = installationMap.get(directory);
  if (!installation) {
    installation = withFinalizerAsync(
      () => installPinnedTool(pinnedTool),
      () => {
        installationMap.delete(directory);
      },
    );
    installationMap.set(directory, installation);
  }
  return installation;
};
