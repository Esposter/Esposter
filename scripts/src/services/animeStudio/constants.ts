// AnimeStudio (github.com/Escartem/AnimeStudio) at the commit the build was proven against: its CLI, its Ooz source and its
// ACL source all come from this one tree
export const ANIMESTUDIO_REPOSITORY = "Escartem/AnimeStudio";
export const ANIMESTUDIO_SHA = "db860e1f9bf0e0314b892782304d44f3ac42c261";
// Texture2DDecoder (github.com/KiruyaMomochi/Texture2DDecoder) at the commit: the native library behind the managed
// Wrapper the CLI references as Kyaru.Texture2DDecoder, whose macOS build the NuGet package does not ship
export const TEXTURE2DDECODER_REPOSITORY = "KiruyaMomochi/Texture2DDecoder";
export const TEXTURE2DDECODER_SHA = "c974dbda1209a6af34cb03941fa0b999627c3623";
// The runtime identifier the CLI is published for, and the framework every project is retargeted to
export const RUNTIME_IDENTIFIER = "osx-arm64";
export const TARGET_FRAMEWORK = "net10.0";
// The CLI's own published name and the folder it is published into, beside the source and the build
export const CLI_PROJECT_PATH = "AnimeStudio.CLI/AnimeStudio.CLI.csproj";
export const CLI_EXECUTABLE_NAME = "AnimeStudio.CLI";
export const WORK_DIRECTORY_NAME = "animestudio-build";
export const PUBLISH_DIRECTORY_NAME = "animestudio-cli";
// AnimeStudio keeps its CAB map in a Maps folder beside its working directory, which is the publish folder, so a rebuild
// Moves that folder aside under KEPT_MAPS_DIRECTORY_NAME, beside the build and outside the publish folder, and back after publish
export const MAPS_DIRECTORY_NAME = "Maps";
export const KEPT_MAPS_DIRECTORY_NAME = "animestudio-maps";
// Where the parity check exports each reference block, beside the build and outside the repository
export const PARITY_DIRECTORY_NAME = "parity";
// The file counts Windows AnimeStudio gives the reference blocks on game 7.1.0, by every type it exports.
// A build's export of each must match them and log no exception. Only 00/15508490 is recorded so far; the rest follow
export const PARITY_REFERENCE_BLOCKS: readonly { block: string; total: number; types: Record<string, number> }[] = [
  { block: "00/15508490.blk", total: 579, types: { Sprite: 246, Texture2D: 325 } },
];
// The names the CLI's native imports resolve to on macOS. .NET probes `lib<import name>.dylib` and `<import name>.dylib`
// Next to the app; the Ooz import keeps its `.dll` suffix, so its library is `libAnimeStudio.Ooz.dll.dylib`
export const OOZ_LIBRARY_FILE_NAME = "libAnimeStudio.Ooz.dll.dylib";
export const TEXTURE2DDECODER_LIBRARY_FILE_NAME = "libTexture2DDecoderNative.dylib";
export const ACL_MHY_LIBRARY_FILE_NAME = "libAnimeStudio.ACL.MHY.dylib";
export const ACL_MHY_DIRECTORY = "AnimeStudio.ACL/AnimeStudio.ACL.MHY";
