import { HOST_SCHEME } from "#src/services/constants";
import { SITE_NAME } from "@esposter/shared";
import { win32 } from "node:path";

// The installed host: the executable, and the Claude Code binary the SDK runs beside it
export const HOST_EXECUTABLE_FILENAME = "agent-console-host.exe";
export const CLAUDE_CODE_EXECUTABLE_FILENAME = "claude.exe";
// The scheme's key in the user's own registry classes, joined the Windows way so no path is spelled by hand
export const HOST_SCHEME_REGISTRY_KEY: string = win32.join("HKCU", "Software", "Classes", HOST_SCHEME);
// Under the user's own local app data, so installing asks no administrator
// Where the uninstall's PowerShell reads the folder it removes, so the path is never part of its command
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template would otherwise infer
export const HOST_DIRECTORY_ENVIRONMENT_VARIABLE: string = `${SITE_NAME.toUpperCase()}_HOST_DIRECTORY`;
export const HOST_INSTALL_DIRECTORY_SEGMENTS: readonly [string, string] = [SITE_NAME, "Host"];
// Where the install writes out node-pty beside the executable: its native addons, worker and agent are files it loads
// From beside its own code, which the executable cannot hold
export const NODE_PTY_DIRECTORY_NAME = "node-pty";
