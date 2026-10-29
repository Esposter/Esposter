import type { SetupLogin } from "#src/models/setup/SetupLogin";
import type { SetupTool } from "#src/models/setup/SetupTool";

import { GENSHIN_FLEET_AREA } from "#src/services/fleet/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { homedir } from "node:os";
import { join } from "node:path";

// The external tools a new machine needs, each found by the command that answers for it, or the file a browser install
// leaves, with the line that installs it on each platform. The first caller of each is in `scripts/src/services`
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
    install: { darwin: "brew install azure-cli", win32: "winget install --id Microsoft.AzureCLI" },
    name: "az",
    probe: { args: ["version"], file: "az" },
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
    install: { darwin: "brew install ffmpeg", win32: "winget install --id Gyan.FFmpeg" },
    name: "ffmpeg",
    probe: { args: ["-version"], file: "ffmpeg" },
  },
  {
    install: { darwin: "brew install yt-dlp", win32: "winget install --id yt-dlp.yt-dlp" },
    name: "yt-dlp",
    probe: { args: ["--version"], file: "yt-dlp" },
  },
  {
    install: { darwin: "brew install --cask dotnet-sdk", win32: "winget install --id Microsoft.DotNet.SDK.10" },
    name: ".NET 10",
    probe: { args: ["--version"], file: "dotnet", output: /^10\./mu },
  },
  {
    install: { darwin: "brew install cmake", win32: "winget install --id Kitware.CMake" },
    name: "cmake",
    probe: { args: ["--version"], file: "cmake" },
  },
  {
    install: { darwin: "xcode-select --install", win32: "winget install --id LLVM.LLVM" },
    name: "C++ compiler",
    probe: { args: ["--version"], file: "clang++" },
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

// The services the machine is logged in to, each probed by the command that succeeds only when it is logged in
export const SETUP_LOGINS: readonly SetupLogin[] = [
  { login: "gh auth login", name: "gh", probe: { args: ["auth", "status"], file: "gh" } },
  { login: "az login", name: "az", probe: { args: ["account", "show"], file: "az" } },
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
// The parity references' restore, as the arguments a spawn takes and as the command a person reads
export const REFERENCES_RESTORE_ARGS: readonly string[] = ["-C", "scripts", "genshin:parity", "references", "restore"];
export const REFERENCES_RESTORE_COMMAND: string = ["pnpm", ...REFERENCES_RESTORE_ARGS].join(" ");
export const MEMORY_FOLDER_NAME = "memory";
// The Windows facts a new machine needs beyond the clone and the logins (the monorepo-tooling page's "Windows machines").
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
