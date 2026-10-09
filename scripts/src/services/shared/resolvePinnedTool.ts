import type { PinnedTool } from "#src/models/shared/PinnedTool";

import { fetchOk } from "#src/services/shared/fetchOk";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { globSync } from "node:fs";
import { mkdtemp, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const findExecutable = (directory: string, executablePattern: string): string | undefined => {
  const [held] = globSync(executablePattern, { cwd: directory });
  return held ? join(directory, held) : undefined;
};
// Fetched and unpacked into a partial folder of the attempt's own renamed onto the tool's, so a write or an unpack cut
// Short is never found as the tool and no other attempt's files are ever removed. A folder left without the executable
// Holds only a stale attempt, and is replaced; one another process has filled since is kept
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
  const partialDirectory = await mkdtemp(`${directory}.partial-`);
  if (isArchive) {
    const archivePath = join(partialDirectory, "archive.zip");
    await writeFile(archivePath, archive);
    // Windows' own tar unpacks a zip; elsewhere the tar on the PATH does, as bsdtar and GNU tar both read one
    const tarPath = process.env.SystemRoot ? join(process.env.SystemRoot, "System32", "tar.exe") : "tar";
    execFileSync(tarPath, ["-xf", archivePath, "-C", partialDirectory]);
    await rm(archivePath);
  } else await writeFile(join(partialDirectory, executablePattern), archive);
  const installed = findExecutable(directory, executablePattern);
  if (installed) {
    await rm(partialDirectory, { force: true, recursive: true });
    return installed;
  }
  await rm(directory, { force: true, recursive: true });
  await rename(partialDirectory, directory);
  const unpacked = findExecutable(directory, executablePattern);
  if (!unpacked) throw new InvalidOperationError(Operation.Read, archiveUrl, `unpacked no ${executablePattern}`);
  return unpacked;
};
// The one installation of each tool's folder this process runs, which every call finding the folder empty awaits
const installationMap = new Map<string, Promise<string>>();

// A pinned tool's executable: fetched, checked against its checksum and unpacked the first time it is needed, and found
// In its folder after that. A bare executable is the download itself, kept under the name its pattern names
export const resolvePinnedTool = (pinnedTool: PinnedTool): Promise<string> => {
  const { directory, executablePattern } = pinnedTool;
  const held = findExecutable(directory, executablePattern);
  if (held) return Promise.resolve(held);
  let installation = installationMap.get(directory);
  if (!installation) {
    installation = installPinnedTool(pinnedTool);
    installationMap.set(directory, installation);
  }
  return installation;
};
