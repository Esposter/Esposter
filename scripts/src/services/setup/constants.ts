/* oxlint-disable typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex literal would otherwise infer; `isolatedDeclarations` demands the annotation this template literal would otherwise infer */
import type { SetupLogin } from "#src/models/setup/SetupLogin";
import type { SetupTool } from "#src/models/setup/SetupTool";

import { GENSHIN_FLEET_AREA } from "#src/services/fleet/constants";
import { resolveVkd3dCompiler, VKD3D_COMPILER_NAME } from "#src/services/genshinAssets/materials/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { homedir } from "node:os";
import { join } from "node:path";

// The external tools a new machine needs, each found by the command that answers for it.
// A tool with no command, such as a browser, is found by the file its install leaves instead.
// Each comes with the line that installs it on each platform. The first caller of each is in `scripts/src/services`.
export const SETUP_TOOLS: readonly SetupTool[] = [
  {
    install: { darwin: "brew install git", win32: "winget install --id Git.Git" },
    name: "git",
    probe: { args: ["--version"], file: "git" },
  },
  {
    install: { darwin: "brew install gh", win32: "winget install --id GitHub.cli" },
    name: "gh",
    probe: { args: ["--version"], file: "gh" },
  },
  {
    install: { darwin: "brew install pulumi/tap/pulumi", win32: "winget install --id Pulumi.Pulumi" },
    name: "pulumi",
    probe: { args: ["version"], file: "pulumi" },
  },
  {
    install: { darwin: "brew install --cask claude-code", win32: "winget install --id Anthropic.ClaudeCode" },
    name: "claude",
    probe: { args: ["--version"], file: "claude" },
  },
  {
    install: { darwin: "brew install ffmpeg", win32: "winget install --id yt-dlp.FFmpeg" },
    name: "ffmpeg",
    probe: { args: ["-version"], file: "ffmpeg" },
  },
  {
    install: { darwin: "brew install yt-dlp", win32: "winget install --id yt-dlp.yt-dlp" },
    name: "yt-dlp",
    probe: { args: ["--version"], file: "yt-dlp" },
  },
  {
    install: { darwin: "brew install --cask microsoft-edge", win32: "winget install --id Microsoft.Edge" },
    name: "Microsoft Edge",
    paths: {
      darwin: "/Applications/Microsoft Edge.app",
      win32: String.raw`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`,
    },
  },
];
// The tools read on macOS alone: the AnimeStudio build's, since a Mac is the one machine that builds the CLI and its
// Natives from source while Windows unpacks a released CLI, and the shaders step's disassembler, which Windows replaces
// With its own compiler library. Homebrew has no vkd3d, so it is built from WineHQ's source with brew's keg-only bison
// And flex first on PATH, brew's headers and MoltenVK named to configure, and installed under the home folder's
// `.local`, so no step asks for a password
export const SETUP_MACOS_TOOLS: readonly SetupTool[] = [
  {
    install: {
      darwin:
        'brew install bison flex spirv-headers vulkan-headers molten-vk, then with $(brew --prefix bison)/bin and $(brew --prefix flex)/bin first on PATH, in the unpacked https://dl.winehq.org/vkd3d/source/vkd3d-2.1.tar.xz run ./configure --prefix="$HOME/.local" --disable-doxygen-doc --disable-tests --without-ncurses CPPFLAGS="-I$(brew --prefix)/include" LDFLAGS="-L$(brew --prefix)/lib" && make && make install, with ~/.local/bin on PATH',
    },
    name: VKD3D_COMPILER_NAME,
    probe: { args: ["--version"], file: resolveVkd3dCompiler() },
  },
  {
    install: { darwin: "brew install --cask dotnet-sdk" },
    name: ".NET 10",
    probe: { args: ["--version"], file: "dotnet", output: /^10\./mu },
  },
  { install: { darwin: "brew install cmake" }, name: "cmake", probe: { args: ["--version"], file: "cmake" } },
  {
    install: { darwin: "xcode-select --install" },
    name: "C++ compiler",
    probe: { args: ["--version"], file: "clang++" },
  },
];

// The services the machine is logged in to, each probed by the command that succeeds only when it is logged in
export const SETUP_LOGINS: readonly SetupLogin[] = [
  { login: "gh auth login", name: "gh", probe: { args: ["auth", "status"], file: "gh" } },
  { login: "pulumi login", name: "pulumi", probe: { args: ["whoami"], file: "pulumi" } },
];

export const HOOKS_PATH_KEY = "core.hooksPath";
export const HOOKS_PATH = ".githooks";
// The file pnpm writes into the root's `node_modules` once an install has finished
export const DEPENDENCIES_MARKER_PATH: string = join(REPOSITORY_ROOT, "node_modules", ".modules.yaml");
// The hosted game data's lock check, as the arguments a spawn takes and as the command a person reads
export const DATA_VERIFY_ARGS: readonly string[] = ["-C", "scripts", "genshin:data", "verify"];
export const DATA_VERIFY_COMMAND: string = ["pnpm", ...DATA_VERIFY_ARGS].join(" ");
export const VP_ENV_INSTALL_NEXT = "vp env install (the Vite+ CLI, https://viteplus.dev/guide/)";
export const PNPM_INSTALL_NEXT = "pnpm i, or pnpm ai:setup --install";
export const GAME_INSTALL_NEXT =
  "only the machine that plays the game holds the install; everything derived from it is published";
export const MEMORY_NEXT = "the owner has not yet chosen where memory lives";
// The parity records' restore, as the arguments a spawn takes and as the command a person reads
export const REFERENCES_RESTORE_ARGS: readonly string[] = ["-C", "scripts", "genshin:parity", "references", "restore"];
export const REFERENCES_RESTORE_COMMAND: string = ["pnpm", ...REFERENCES_RESTORE_ARGS].join(" ");
export const MEMORY_FOLDER_NAME = "memory";
// The Windows facts a new machine needs beyond the clone and the logins (the recoverability page's setup command).
// Each is checked and printed with what to do; none is installed by the command
export const CORE_SYMLINKS_KEY = "core.symlinks";
export const SYMLINKS_ENABLED_VALUE = "true";
export const SYMLINKS_NEXT =
  "git config core.symlinks true, then check the repository out again: Developer Mode or an elevated shell is needed to create the links";
export const LONG_PATHS_KEY: string = String.raw`HKLM\SYSTEM\CurrentControlSet\Control\FileSystem`;
export const LONG_PATHS_VALUE_NAME = "LongPathsEnabled";
export const LONG_PATHS_ENABLED_REGEX: RegExp = new RegExp(`${LONG_PATHS_VALUE_NAME}\\s+REG_DWORD\\s+0x1\\b`, "u");
export const LONG_PATHS_NEXT: string = String.raw`from an elevated PowerShell run Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' -Name LongPathsEnabled -Value 1, then restart the terminal`;
export const SSH_DIRECTORY: string = join(homedir(), ".ssh");
export const SSH_PUBLIC_KEY_NAMES: readonly string[] = ["id_ed25519.pub", "id_rsa.pub"];
export const SSH_KEY_NEXT = "ssh-keygen -t ed25519, then give its .pub to the peer";
export const FLEET_PROFILE_COMMAND = "pnpm ai:fleet:profile";
export const GENSHIN_ONLY_NEXT: string = `set its areas to ["${GENSHIN_FLEET_AREA}"], the owner's rule: no non-Genshin work until Genshin is done`;
export const PEERS_NEXT = "write it by hand, since no command writes it";
