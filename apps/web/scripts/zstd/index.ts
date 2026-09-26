import {
  COMPRESS_WITH_DICTIONARY_SOURCE_PATH,
  ZIG_VERSION,
  ZSTD_COMPILE_ARGUMENTS,
  ZSTD_SOURCE_SHA256,
  ZSTD_SOURCE_URL,
  ZSTD_VERSION,
  ZSTD_WASM_DIRECTORY,
  ZSTD_WASM_PATH,
} from "@@/scripts/zstd/constants";
import { downloadVerifiedFile } from "@@/scripts/zstd/services/downloadVerifiedFile";
import { extractArchive } from "@@/scripts/zstd/services/extractArchive";
import { readZigRelease } from "@@/scripts/zstd/services/readZigRelease";
import { withFinalizerAsync } from "@esposter/shared";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const readSourceFiles = async (directory: string) =>
  (await readdir(directory)).filter((name) => name.endsWith(".c")).map((name) => join(directory, name));
// Builds the browser's zstd encoder from pinned upstream source. Run only to move the zstd version: the output is
// Committed, so nothing else ever needs a compiler (/docs/resource/delta-content-saves)
const workDirectory = await mkdtemp(join(tmpdir(), "zstd-"));
await withFinalizerAsync(
  async () => {
    const zigRelease = await readZigRelease();
    const zigArchivePath = join(workDirectory, basename(zigRelease.tarball));
    const zstdArchivePath = join(workDirectory, basename(ZSTD_SOURCE_URL));
    await Promise.all([
      downloadVerifiedFile(zigRelease.tarball, zigRelease.shasum, zigArchivePath),
      downloadVerifiedFile(ZSTD_SOURCE_URL, ZSTD_SOURCE_SHA256, zstdArchivePath),
    ]);
    // Only the library: the release's test fixtures hold symlinks a Windows checkout cannot create
    const libraryMember = `zstd-${ZSTD_VERSION}/lib`;
    await Promise.all([
      extractArchive(zigArchivePath, workDirectory),
      extractArchive(zstdArchivePath, workDirectory, [libraryMember]),
    ]);
    const zigDirectory = basename(zigRelease.tarball).replace(/\.(?:zip|tar\.xz)$/u, "");
    const libraryDirectory = join(workDirectory, libraryMember);
    const commonDirectory = join(libraryDirectory, "common");
    const [commonSources, compressSources] = await Promise.all([
      readSourceFiles(commonDirectory),
      readSourceFiles(join(libraryDirectory, "compress")),
    ]);
    await rm(ZSTD_WASM_DIRECTORY, { force: true, recursive: true });
    await mkdir(ZSTD_WASM_DIRECTORY, { recursive: true });
    await execFileAsync(join(workDirectory, zigDirectory, "zig"), [
      "cc",
      ...ZSTD_COMPILE_ARGUMENTS,
      `-I${libraryDirectory}`,
      `-I${commonDirectory}`,
      COMPRESS_WITH_DICTIONARY_SOURCE_PATH,
      ...commonSources,
      ...compressSources,
      "-o",
      ZSTD_WASM_PATH,
    ]);
    console.log(`Built ${ZSTD_WASM_PATH} from zstd ${ZSTD_VERSION} with zig ${ZIG_VERSION}`);
  },
  () => rm(workDirectory, { force: true, recursive: true }),
);
