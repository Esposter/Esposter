import {
  ACL_MHY_DIRECTORY,
  ACL_MHY_LIBRARY_FILE_NAME,
  ANIMESTUDIO_REPOSITORY,
  ANIMESTUDIO_SHA,
  CLI_EXECUTABLE_NAME,
  CLI_PROJECT_PATH,
  KEPT_MAPS_DIRECTORY_NAME,
  MAPS_DIRECTORY_NAME,
  OOZ_LIBRARY_FILE_NAME,
  PARITY_DIRECTORY_NAME,
  PARITY_REFERENCE_BLOCKS,
  PARITY_TYPE_EXPORT_ARGUMENTS,
  PUBLISH_DIRECTORY_NAME,
  RUNTIME_IDENTIFIER,
  TARGET_FRAMEWORK,
  TEXTURE2DDECODER_LIBRARY_FILE_NAME,
  TEXTURE2DDECODER_REPOSITORY,
  TEXTURE2DDECODER_SHA,
  WORK_DIRECTORY_NAME,
} from "#src/services/animeStudio/constants";
import { GAME_BLOCKS_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { readAnimeStudioExceptions } from "#src/services/genshinAssets/shared/readAnimeStudioExceptions";
import { checkIsGameRunning } from "#src/services/genshinParity/shared/checkIsGameRunning";
import { GAME_EXECUTABLE_NAME } from "#src/services/genshinParity/shared/constants";
import { fetchOk } from "#src/services/shared/fetchOk";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { availableParallelism } from "node:os";
import { dirname, join, parse, resolve } from "node:path";

const run = (command: string, args: string[], cwd?: string): void => {
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  if (result.status !== 0)
    throw new InvalidOperationError(Operation.Create, command, `exited with status ${result.status ?? "none"}`);
};

// A commit's tree as codeload serves it: fetched by its SHA, so a moved branch changes nothing
const fetchSource = async (repository: string, sha: string, workDirectory: string, name: string): Promise<string> => {
  const response = await fetchOk(`https://codeload.github.com/${repository}/tar.gz/${sha}`);
  const archive = join(workDirectory, `${name}.tar.gz`);
  const destination = join(workDirectory, name);
  writeFileSync(archive, Buffer.from(await response.arrayBuffer()));
  mkdirSync(destination, { recursive: true });
  run("tar", ["-xzf", archive, "-C", destination, "--strip-components=1"]);
  return destination;
};

// The edits the Windows build's projects need to publish on macOS: every target framework moved to the one the
// Build uses, and the Windows runtime identifier dropped so the publish's own runtime decides
const retargetProjects = (root: string): void => {
  const projectPaths = readdirSync(root, { recursive: true })
    .map(String)
    .filter((path) => path.endsWith(".csproj"));
  for (const projectPath of projectPaths) {
    const absolutePath = join(root, projectPath);
    const retargeted = readFileSync(absolutePath, "utf8")
      .replaceAll(
        /<TargetFrameworks>[^<]*<\/TargetFrameworks>/gu,
        `<TargetFramework>${TARGET_FRAMEWORK}</TargetFramework>`,
      )
      .replaceAll(
        /<TargetFramework>net[^<]*<\/TargetFramework>/gu,
        `<TargetFramework>${TARGET_FRAMEWORK}</TargetFramework>`,
      )
      .replaceAll(/^[ \t]*<RuntimeIdentifier>win-x64<\/RuntimeIdentifier>\r?\n/gmu, "");
    writeFileSync(absolutePath, retargeted);
  }
};

// Ooz copies a match eight bytes at a time, which reads unwritten bytes when the match is closer than eight bytes.
// Such copies take a byte at a time, so the output no longer depends on what the buffer held before.
const OOZ_COPY_64 = `static inline void oozCopy64(void *destination, const void *source) {
  uint8_t *d = (uint8_t *)destination;
  const uint8_t *s = (const uint8_t *)source;
  if ((uintptr_t)(d - s) < 8) {
    for (int i = 0; i < 8; i++)
      d[i] = s[i];
  } else {
    uint64_t value;
    memcpy(&value, s, 8);
    memcpy(d, &value, 8);
  }
}

static inline void oozCopy64Add(void *destination, const void *literals, const void *window) {
  uint8_t *d = (uint8_t *)destination;
  const uint8_t *t = (const uint8_t *)window;
  if ((uintptr_t)(d - t) < 8) {
    for (int i = 0; i < 8; i++)
      d[i] = (uint8_t)(((const uint8_t *)literals)[i] + t[i]);
  } else {
    simde_mm_storel_epi64((simde__m128i *)destination, simde_mm_add_epi8(simde_mm_loadl_epi64((simde__m128i *)literals), simde_mm_loadl_epi64((simde__m128i *)window)));
  }
}

#define COPY_64(d, s) oozCopy64((d), (s))\n`;
const OOZ_COPY_64_ADD = "#define COPY_64_ADD(d, s, t) oozCopy64Add((d), (s), (t))\n";

const replaceOnce = (source: string, pattern: RegExp, replacement: string): string => {
  if (!pattern.test(source))
    throw new InvalidOperationError(Operation.Update, "kraken.cpp", "has no copy macro to replace at this commit");
  return source.replace(pattern, replacement);
};

// The one edit to Ooz's own source, replacing its match copy macros with the overlap-safe copies above.
// The pinned commit's macro text is matched exactly, so a bumped commit that moved them fails here.
const patchOozCopies = (oozDirectory: string): void => {
  const path = join(oozDirectory, "kraken.cpp");
  const source = readFileSync(path, "utf8");
  const patched = replaceOnce(
    replaceOnce(source, /#define COPY_64\(d, s\)[\s\S]*?\n {4}\}\n/u, OOZ_COPY_64),
    /#define COPY_64_ADD\(d, s, t\) [^\n]*\n/u,
    OOZ_COPY_64_ADD,
  );
  writeFileSync(path, patched);
};

const replaceCounted = (source: string, search: string, replacement: string, expected: number): string => {
  const occurrences = source.split(search).length - 1;
  if (occurrences !== expected)
    throw new InvalidOperationError(
      Operation.Update,
      "kraken.cpp",
      `has ${occurrences} of ${JSON.stringify(search)} where ${expected} were expected at this commit`,
    );
  return source.replaceAll(search, replacement);
};

// The Leviathan decoder keeps each match's offset as a size_t, so its copy source, dst + offset, wraps for every backward match.
// That overflow is undefined: the optimizer may move a copy's load above the store of the copy before it, reading a stale byte.
// Windows' build never reads one, so the offset is signed.
const patchOozSignedOffsets = (oozDirectory: string): void => {
  const path = join(oozDirectory, "kraken.cpp");
  const source = readFileSync(path, "utf8");
  const patched = replaceCounted(
    replaceCounted(source, "size_t last_offset", "ptrdiff_t last_offset", 12),
    "  size_t offset = -8;\n",
    "  ptrdiff_t offset = -8;\n",
    1,
  );
  writeFileSync(path, patched);
};

const buildCmakeLibrary = (source: string, build: string, options: string[], output: string): string => {
  run("cmake", ["-S", source, "-B", build, "-DCMAKE_BUILD_TYPE=Release", ...options]);
  run("cmake", ["--build", build, "--config", "Release", "-j", String(availableParallelism())]);
  return join(build, output);
};

// ACL's Windows projects also build under clang with its own flags; only the MHY library's source compiles unmodified
const buildAclLibrary = (projectDirectory: string, output: string): string => {
  const sources = readdirSync(projectDirectory).filter((file) => file.endsWith(".cpp"));
  run(
    "clang++",
    [
      "-std=c++14",
      "-fms-extensions",
      "-O2",
      "-fPIC",
      "-shared",
      "-DNDEBUG",
      "-D_AS_DLL",
      "-DACLMHY_EXPORTS",
      "-I.",
      "-I..",
      ...sources,
      "-o",
      output,
    ],
    projectDirectory,
  );
  return output;
};

const countFiles = (directory: string): number =>
  readdirSync(directory, { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile()).length;

// Exports one reference block with the freshly published CLI, one run per parity type as Windows' counts were taken,
// And compares each type's file count with the table. No run may name an exception
const checkParityBlock = (cliPath: string, block: string, types: Record<string, number>, directory: string): void => {
  const mismatches: string[] = [];
  const typeCounts: Record<string, number> = {};
  for (const [type, exportArguments] of Object.entries(PARITY_TYPE_EXPORT_ARGUMENTS)) {
    const outputDirectory = join(directory, PARITY_DIRECTORY_NAME, parse(block).name, type);
    rmSync(outputDirectory, { force: true, recursive: true });
    mkdirSync(outputDirectory, { recursive: true });
    const { error, status, stderr, stdout } = spawnSync(
      cliPath,
      [
        join(GAME_BLOCKS_DIRECTORY, block),
        outputDirectory,
        "--types",
        type,
        ...exportArguments,
        "--group_assets",
        "ByType",
        "--game",
        "GI",
        "--logger_flags",
        "Warning",
        "Error",
      ],
      { cwd: dirname(cliPath), encoding: "utf8", maxBuffer: 1024 ** 3 },
    );
    if (status !== 0)
      throw new InvalidOperationError(
        Operation.Create,
        block,
        stderr || stdout || error?.message || `exited ${status}`,
      );
    mismatches.push(...readAnimeStudioExceptions(`${stdout}\n${stderr}`).slice(0, 5));
    const typeDirectory = join(outputDirectory, type);
    typeCounts[type] = existsSync(typeDirectory) ? countFiles(typeDirectory) : 0;
    if (typeCounts[type] !== (types[type] ?? 0))
      mismatches.push(`${type} ${typeCounts[type]}, Windows ${types[type] ?? 0}`);
  }
  if (mismatches.length > 0)
    throw new InvalidOperationError(Operation.Create, block, `does not match Windows: ${mismatches.join("; ")}`);
  console.log(`${block}: ${JSON.stringify(typeCounts)}, matches Windows`);
};

// The parity acceptance test, run after publish: each reference block in the table is exported and compared.
// The game's blocks are read from its install, so when they are absent the check fails.
// It is skipped only with --skip-parity, which prints the reason.
const checkParity = (cliPath: string, directory: string, skipParity: boolean): void => {
  const absentBlocks = PARITY_REFERENCE_BLOCKS.filter(({ block }) => !existsSync(join(GAME_BLOCKS_DIRECTORY, block)));
  if (absentBlocks.length > 0) {
    const reason = `the game's blocks are absent under ${GAME_BLOCKS_DIRECTORY} (${absentBlocks.map(({ block }) => block).join(", ")})`;
    if (skipParity) {
      console.log(`Parity check skipped: ${reason}.`);
      return;
    }
    throw new InvalidOperationError(
      Operation.Read,
      GAME_BLOCKS_DIRECTORY,
      `${reason}; pass --skip-parity to build without the parity check`,
    );
  }
  if (checkIsGameRunning())
    throw new InvalidOperationError(
      Operation.Read,
      GAME_EXECUTABLE_NAME,
      "is running: close the game before AnimeStudio reads its blocks",
    );
  for (const { block, types } of PARITY_REFERENCE_BLOCKS) checkParityBlock(cliPath, block, types, directory);
  rmSync(join(directory, PARITY_DIRECTORY_NAME), { force: true, recursive: true });
};

// Builds the CLI and its natives for macOS, and returns the path the CLI is published to. The CLI carries its own runtime,
// So it starts wherever .NET was installed from, with no DOTNET_ROOT for the asset runs to pass it. The directory is
// Resolved first, since clang++ runs from ACL's source and the printed path is set from anywhere. A rebuild keeps the
// CAB map, which a map run takes hours to rebuild, and the parity check must pass before the path is returned
export const buildAnimeStudio = async (directory: string, skipParity = false): Promise<string> => {
  const outputDirectory = resolve(directory);
  const workDirectory = join(outputDirectory, WORK_DIRECTORY_NAME);
  const publishDirectory = join(outputDirectory, PUBLISH_DIRECTORY_NAME);
  const keptMapsDirectory = join(outputDirectory, KEPT_MAPS_DIRECTORY_NAME);
  if (existsSync(join(publishDirectory, MAPS_DIRECTORY_NAME))) {
    rmSync(keptMapsDirectory, { force: true, recursive: true });
    renameSync(join(publishDirectory, MAPS_DIRECTORY_NAME), keptMapsDirectory);
  }
  rmSync(workDirectory, { force: true, recursive: true });
  rmSync(publishDirectory, { force: true, recursive: true });
  mkdirSync(workDirectory, { recursive: true });

  const animeStudio = await fetchSource(ANIMESTUDIO_REPOSITORY, ANIMESTUDIO_SHA, workDirectory, "AnimeStudio");
  const texture2DDecoder = await fetchSource(
    TEXTURE2DDECODER_REPOSITORY,
    TEXTURE2DDECODER_SHA,
    workDirectory,
    "Texture2DDecoder",
  );
  retargetProjects(animeStudio);
  patchOozCopies(join(animeStudio, "AnimeStudio.Ooz"));
  patchOozSignedOffsets(join(animeStudio, "AnimeStudio.Ooz"));

  const oozLibrary = buildCmakeLibrary(
    join(animeStudio, "AnimeStudio.Ooz"),
    join(workDirectory, "build-ooz"),
    ["-DOOZ_BUILD_EXE=OFF", "-DOOZ_BUILD_BUN=OFF", "-DOOZ_BUILD_VALIDATE=OFF"],
    "liblibooz.dylib",
  );
  const texture2DDecoderLibrary = buildCmakeLibrary(
    join(texture2DDecoder, "Texture2DDecoderNative"),
    join(workDirectory, "build-texture2ddecoder"),
    ["-DBUILD_SHARED_LIBS=ON", "-DCMAKE_OSX_ARCHITECTURES=arm64"],
    "libTexture2DDecoderNative.dylib",
  );
  const aclMhyLibrary = buildAclLibrary(
    join(animeStudio, ACL_MHY_DIRECTORY),
    join(workDirectory, ACL_MHY_LIBRARY_FILE_NAME),
  );

  run("dotnet", [
    "publish",
    join(animeStudio, CLI_PROJECT_PATH),
    "-c",
    "Release",
    "-r",
    RUNTIME_IDENTIFIER,
    "--self-contained",
    "true",
    "-o",
    publishDirectory,
  ]);
  copyFileSync(oozLibrary, join(publishDirectory, OOZ_LIBRARY_FILE_NAME));
  copyFileSync(texture2DDecoderLibrary, join(publishDirectory, TEXTURE2DDECODER_LIBRARY_FILE_NAME));
  copyFileSync(aclMhyLibrary, join(publishDirectory, ACL_MHY_LIBRARY_FILE_NAME));
  if (existsSync(keptMapsDirectory)) renameSync(keptMapsDirectory, join(publishDirectory, MAPS_DIRECTORY_NAME));

  const cliPath = join(publishDirectory, CLI_EXECUTABLE_NAME);
  checkParity(cliPath, outputDirectory, skipParity);
  return cliPath;
};
