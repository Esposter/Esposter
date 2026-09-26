import { execFile } from "node:child_process";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
// Every platform ships a `tar` that reads its own Zig archive and the zstd tarball — bsdtar on Windows and macOS
// Takes a zip as well. On Windows it is named by path, because Git's GNU tar shadows it on a developer's PATH and
// Reads neither a drive letter nor a zip
const TAR_PATH =
  process.platform === "win32" ? join(process.env.SystemRoot ?? "C:\\Windows", "System32", "tar.exe") : "tar";

export const extractArchive = async (archivePath: string, directory: string, members: string[] = []) => {
  await execFileAsync(TAR_PATH, ["-xf", archivePath, "-C", directory, ...members]);
};
