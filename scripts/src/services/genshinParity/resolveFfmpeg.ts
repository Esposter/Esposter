import {
  FFMPEG_ARCHIVE_SHA256,
  FFMPEG_ARCHIVE_URL,
  FFMPEG_DIRECTORY,
  FFMPEG_DOWNLOAD_TIMEOUT_MS,
} from "#src/services/genshinParity/constants";
import { fetchOk } from "#src/services/shared/fetchOk";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { globSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const FFMPEG_PATTERN = "*/bin/ffmpeg.exe";
// The pinned FFmpeg, fetched, checked against its checksum and unpacked the first time it is needed, and found in its
// Folder after that. Windows' own tar unpacks it, since it reads a zip and Git's tar does not
export const resolveFfmpeg = async (): Promise<string> => {
  const [held] = globSync(FFMPEG_PATTERN, { cwd: FFMPEG_DIRECTORY });
  if (held) return join(FFMPEG_DIRECTORY, held);
  const response = await fetchOk(FFMPEG_ARCHIVE_URL, FFMPEG_DOWNLOAD_TIMEOUT_MS);
  const archive = new Uint8Array(await response.arrayBuffer());
  const checksum = createHash("sha256").update(archive).digest("hex");
  if (checksum !== FFMPEG_ARCHIVE_SHA256)
    throw new InvalidOperationError(Operation.Read, FFMPEG_ARCHIVE_URL, `has checksum ${checksum}, not the pinned one`);
  await mkdir(FFMPEG_DIRECTORY, { recursive: true });
  const archivePath = join(FFMPEG_DIRECTORY, "ffmpeg.zip");
  await writeFile(archivePath, archive);
  const tarPath = join(process.env.SystemRoot ?? String.raw`C:\Windows`, "System32", "tar.exe");
  execFileSync(tarPath, ["-xf", archivePath, "-C", FFMPEG_DIRECTORY]);
  await rm(archivePath);
  const [unpacked] = globSync(FFMPEG_PATTERN, { cwd: FFMPEG_DIRECTORY });
  if (!unpacked) throw new InvalidOperationError(Operation.Read, FFMPEG_ARCHIVE_URL, `unpacked no ${FFMPEG_PATTERN}`);
  return join(FFMPEG_DIRECTORY, unpacked);
};
