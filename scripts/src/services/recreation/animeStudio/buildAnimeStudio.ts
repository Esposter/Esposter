import { applyOodlePatch } from "#src/services/recreation/animeStudio/applyOodlePatch";
import { buildAclLibrary } from "#src/services/recreation/animeStudio/buildAclLibrary";
import { buildCmakeLibrary } from "#src/services/recreation/animeStudio/buildCmakeLibrary";
import {
  ACL_MHY_DIRECTORY,
  ACL_MHY_LIBRARY_FILE_NAME,
  ANIMESTUDIO_REPOSITORY,
  ANIMESTUDIO_SHA,
  CLI_EXECUTABLE_NAME,
  CLI_PROJECT_PATH,
  MAPS_DIRECTORY_NAME,
  OOZ_LIBRARY_FILE_NAME,
  PUBLISH_DIRECTORY_NAME,
  RUNTIME_IDENTIFIER,
  STAGING_DIRECTORY_NAME,
  TEXTURE2DDECODER_LIBRARY_FILE_NAME,
  TEXTURE2DDECODER_REPOSITORY,
  TEXTURE2DDECODER_SHA,
  WORK_DIRECTORY_NAME,
} from "#src/services/recreation/animeStudio/constants";
import { fetchSource } from "#src/services/recreation/animeStudio/fetchSource";
import { patchAnimatorControllerExport } from "#src/services/recreation/animeStudio/patchAnimatorControllerExport";
import { patchOozCopies } from "#src/services/recreation/animeStudio/patchOozCopies";
import { patchOozSignedOffsets } from "#src/services/recreation/animeStudio/patchOozSignedOffsets";
import { resolveBuildDirectory } from "#src/services/recreation/animeStudio/resolveBuildDirectory";
import { retargetProjects } from "#src/services/recreation/animeStudio/retargetProjects";
import { run } from "#src/services/recreation/animeStudio/run";
import { copyFileSync, existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";

// Builds the CLI and its natives for macOS, and returns the path the CLI is published to. The CLI carries its own
// Runtime, so it starts wherever .NET was installed from, with no DOTNET_ROOT for the asset runs to pass it. The
// Directory is named by its real path first, since clang++ runs from ACL's source and the printed path is set from
// Anywhere, and NuGet's restore drops a project reference reached through a symlink. A rebuild keeps the CAB map, which
// A map run takes hours to rebuild. The CLI is published to a staging folder and replaces the published one only once
// The parity check passes, so a failed rebuild leaves the published CLI as it was. The parity runs pass no map, so the
// Staged CLI is checked without the CAB map, which moves over only on the pass
export const buildAnimeStudio = async (
  directory: string,
  checkParity: (cliPath: string, outputDirectory: string) => void,
): Promise<string> => {
  const outputDirectory = resolveBuildDirectory(directory);
  const workDirectory = join(outputDirectory, WORK_DIRECTORY_NAME);
  const publishDirectory = join(outputDirectory, PUBLISH_DIRECTORY_NAME);
  const stagingDirectory = join(outputDirectory, STAGING_DIRECTORY_NAME);
  rmSync(workDirectory, { force: true, recursive: true });
  rmSync(stagingDirectory, { force: true, recursive: true });
  mkdirSync(workDirectory, { recursive: true });

  const [animeStudio, texture2DDecoder] = await Promise.all([
    fetchSource(ANIMESTUDIO_REPOSITORY, ANIMESTUDIO_SHA, workDirectory, "AnimeStudio"),
    fetchSource(TEXTURE2DDECODER_REPOSITORY, TEXTURE2DDECODER_SHA, workDirectory, "Texture2DDecoder"),
  ]);
  applyOodlePatch(animeStudio);
  retargetProjects(animeStudio);
  patchOozCopies(join(animeStudio, "AnimeStudio.Ooz"));
  patchOozSignedOffsets(join(animeStudio, "AnimeStudio.Ooz"));
  patchAnimatorControllerExport(animeStudio);

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
    stagingDirectory,
  ]);
  copyFileSync(oozLibrary, join(stagingDirectory, OOZ_LIBRARY_FILE_NAME));
  copyFileSync(texture2DDecoderLibrary, join(stagingDirectory, TEXTURE2DDECODER_LIBRARY_FILE_NAME));
  copyFileSync(aclMhyLibrary, join(stagingDirectory, ACL_MHY_LIBRARY_FILE_NAME));
  checkParity(join(stagingDirectory, CLI_EXECUTABLE_NAME), outputDirectory);

  const publishedMapsDirectory = join(publishDirectory, MAPS_DIRECTORY_NAME);
  if (existsSync(publishedMapsDirectory))
    renameSync(publishedMapsDirectory, join(stagingDirectory, MAPS_DIRECTORY_NAME));
  rmSync(publishDirectory, { force: true, recursive: true });
  renameSync(stagingDirectory, publishDirectory);
  return join(publishDirectory, CLI_EXECUTABLE_NAME);
};
