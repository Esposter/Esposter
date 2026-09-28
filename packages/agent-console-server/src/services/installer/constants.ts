import { SITE_NAME } from "@esposter/shared";
import { win32 } from "node:path";

// The installed host: the executable, the Claude Code binary the SDK runs beside it, and the link scheme a page opens
// To start it
export const HOST_EXECUTABLE_FILENAME = "agent-console-host.exe";
export const CLAUDE_CODE_EXECUTABLE_FILENAME = "claude.exe";
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template would otherwise infer
export const HOST_SCHEME: string = `${SITE_NAME.toLowerCase()}-host`;
// The scheme's key in the user's own registry classes, joined the Windows way so no path is spelled by hand
export const HOST_SCHEME_REGISTRY_KEY: string = win32.join("HKCU", "Software", "Classes", HOST_SCHEME);
// Under the user's own local app data, so installing asks no administrator
// Where the uninstall's PowerShell reads the folder it removes, so the path is never part of its command
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template would otherwise infer
export const HOST_DIRECTORY_ENVIRONMENT_VARIABLE: string = `${SITE_NAME.toUpperCase()}_HOST_DIRECTORY`;
export const HOST_INSTALL_DIRECTORY_SEGMENTS: readonly [string, string] = [SITE_NAME, "Host"];
