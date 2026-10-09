import {
  ACL_MHY_DIRECTORY,
  ACL_MHY_LIBRARY_FILE_NAME,
  ANIMESTUDIO_REPOSITORY,
  ANIMESTUDIO_SHA,
  CLI_EXECUTABLE_NAME,
  CLI_PROJECT_PATH,
  OOZ_LIBRARY_FILE_NAME,
  PUBLISH_DIRECTORY_NAME,
  RUNTIME_IDENTIFIER,
  TARGET_FRAMEWORK,
  TEXTURE2DDECODER_LIBRARY_FILE_NAME,
  TEXTURE2DDECODER_REPOSITORY,
  TEXTURE2DDECODER_SHA,
  WORK_DIRECTORY_NAME,
} from "#src/services/animeStudio/constants";
import { fetchOk } from "#src/services/shared/fetchOk";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

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
    .filter((path) => path.endsWith(".csproj") && !path.includes("node_modules"));
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

const buildCmakeLibrary = (source: string, build: string, options: string[], output: string): string => {
  run("cmake", ["-S", source, "-B", build, "-DCMAKE_BUILD_TYPE=Release", ...options]);
  run("cmake", ["--build", build, "--config", "Release", "-j", "8"]);
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

// Builds the CLI and its natives for macOS, and returns the path the CLI is published to
export const buildAnimeStudio = async (directory: string): Promise<string> => {
  const workDirectory = join(directory, WORK_DIRECTORY_NAME);
  const publishDirectory = join(directory, PUBLISH_DIRECTORY_NAME);
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
    "false",
    "-o",
    publishDirectory,
  ]);
  copyFileSync(oozLibrary, join(publishDirectory, OOZ_LIBRARY_FILE_NAME));
  copyFileSync(texture2DDecoderLibrary, join(publishDirectory, TEXTURE2DDECODER_LIBRARY_FILE_NAME));
  copyFileSync(aclMhyLibrary, join(publishDirectory, ACL_MHY_LIBRARY_FILE_NAME));

  return join(publishDirectory, CLI_EXECUTABLE_NAME);
};
