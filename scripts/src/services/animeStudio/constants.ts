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
// The names the CLI's native imports resolve to on macOS. .NET probes `lib<import name>.dylib` and `<import name>.dylib`
// Next to the app; the Ooz import keeps its `.dll` suffix, so its library is `libAnimeStudio.Ooz.dll.dylib`
export const OOZ_LIBRARY_FILE_NAME = "libAnimeStudio.Ooz.dll.dylib";
export const TEXTURE2DDECODER_LIBRARY_FILE_NAME = "libTexture2DDecoderNative.dylib";
export const ACL_MHY_LIBRARY_FILE_NAME = "libAnimeStudio.ACL.MHY.dylib";
export const ACL_MHY_DIRECTORY = "AnimeStudio.ACL/AnimeStudio.ACL.MHY";
