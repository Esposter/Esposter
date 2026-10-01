import type { PinnedTool } from "#src/models/shared/PinnedTool";

import { fetchOk } from "#src/services/shared/fetchOk";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { globSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

// A pinned tool's executable: fetched, checked against its checksum and unpacked the first time it is needed, and found
// In its folder after that. Windows' own tar unpacks it, since it reads a zip and Git's tar does not
export const resolvePinnedTool = async ({
  archiveSha256,
  archiveUrl,
  directory,
  downloadTimeoutMs,
  executablePattern,
}: PinnedTool): Promise<string> => {
  const [held] = globSync(executablePattern, { cwd: directory });
  if (held) return join(directory, held);
  const response = await fetchOk(archiveUrl, downloadTimeoutMs);
  const archive = new Uint8Array(await response.arrayBuffer());
  const checksum = createHash("sha256").update(archive).digest("hex");
  if (checksum !== archiveSha256)
    throw new InvalidOperationError(Operation.Read, archiveUrl, `has checksum ${checksum}, not the pinned one`);
  await mkdir(directory, { recursive: true });
  const archivePath = join(directory, "archive.zip");
  await writeFile(archivePath, archive);
  const tarPath = join(process.env.SystemRoot ?? String.raw`C:\Windows`, "System32", "tar.exe");
  execFileSync(tarPath, ["-xf", archivePath, "-C", directory]);
  await rm(archivePath);
  const [unpacked] = globSync(executablePattern, { cwd: directory });
  if (!unpacked) throw new InvalidOperationError(Operation.Read, archiveUrl, `unpacked no ${executablePattern}`);
  return join(directory, unpacked);
};
