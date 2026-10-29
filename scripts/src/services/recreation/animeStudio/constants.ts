import { SITE_NAME } from "@esposter/shared";
import { homedir } from "node:os";
import { join } from "node:path";

// Where the sources, the builds and the published CLI are kept by default, outside the repository
export const TOOLS_DIRECTORY: string = join(homedir(), SITE_NAME, "tools");
// AnimeStudio (github.com/Escartem/AnimeStudio) at the commit the build was proven against: its CLI, its Ooz source and its
// ACL source all come from this one tree
export const ANIMESTUDIO_REPOSITORY = "Escartem/AnimeStudio";
export const ANIMESTUDIO_SHA = "db860e1f9bf0e0314b892782304d44f3ac42c261";
// Texture2DDecoder (github.com/KiruyaMomochi/Texture2DDecoder) at the commit: the native library behind the managed
// Wrapper the CLI references as Kyaru.Texture2DDecoder, whose macOS build the NuGet package does not ship
export const TEXTURE2DDECODER_REPOSITORY = "KiruyaMomochi/Texture2DDecoder";
export const TEXTURE2DDECODER_SHA = "c974dbda1209a6af34cb03941fa0b999627c3623";
// The one patch the build applies to the checked-out AnimeStudio tree: its OodleHelper.cs carries a fingerprint hook
// behind the ANIMESTUDIO_OODLE_LOG variable, so a fresh machine builds the same source as the clone that wrote the hook
export const OODLE_HELPER_PATCH_PATH: string = join(import.meta.dirname, "patches", "OodleHelper.patch");
// The runtime identifier the CLI is published for, and the framework every project is retargeted to
export const RUNTIME_IDENTIFIER = "osx-arm64";
export const TARGET_FRAMEWORK = "net10.0";
// The CLI's own published name and the folder it is published into, beside the source and the build
export const CLI_PROJECT_PATH = "AnimeStudio.CLI/AnimeStudio.CLI.csproj";
export const CLI_EXECUTABLE_NAME = "AnimeStudio.CLI";
export const WORK_DIRECTORY_NAME = "animestudio-build";
export const PUBLISH_DIRECTORY_NAME = "animestudio-cli";
// Where a rebuild publishes first, so the published CLI is replaced only once the new one passes the parity check
export const STAGING_DIRECTORY_NAME = "animestudio-cli-staging";
// AnimeStudio keeps its CAB map in a Maps folder beside its working directory, which is the publish folder, so a rebuild
// Moves that folder into the staged CLI's once the staged CLI passes, before the staged folder replaces the published one
export const MAPS_DIRECTORY_NAME = "Maps";
// The names the CLI's native imports resolve to on macOS. .NET probes `lib<import name>.dylib` and `<import name>.dylib`
// Next to the app; the Ooz import keeps its `.dll` suffix, so its library is `libAnimeStudio.Ooz.dll.dylib`
export const OOZ_LIBRARY_FILE_NAME = "libAnimeStudio.Ooz.dll.dylib";
export const TEXTURE2DDECODER_LIBRARY_FILE_NAME = "libTexture2DDecoderNative.dylib";
export const ACL_MHY_LIBRARY_FILE_NAME = "libAnimeStudio.ACL.MHY.dylib";
export const ACL_MHY_DIRECTORY = "AnimeStudio.ACL/AnimeStudio.ACL.MHY";
// The available memory an AnimeStudio run waits for, in gigabytes, and how long it waits between readings, in milliseconds
export const MIN_AVAILABLE_MEMORY_GIGABYTES = 4;
export const MEMORY_WAIT_MILLISECONDS = 30_000;
