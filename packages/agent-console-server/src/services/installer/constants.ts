import { win32 } from "node:path";

// The installed host: the executable, the Claude Code binary the SDK runs beside it, and the link scheme a page opens
// To start it
export const HOST_EXECUTABLE_FILENAME = "agent-console-host.exe";
export const CLAUDE_CODE_EXECUTABLE_FILENAME = "claude.exe";
export const HOST_SCHEME = "esposter-host";
// The scheme's key in the user's own registry classes, joined the Windows way so no path is spelled by hand
export const HOST_SCHEME_REGISTRY_KEY: string = win32.join("HKCU", "Software", "Classes", HOST_SCHEME);
// Under the user's own local app data, so installing asks no administrator
export const HOST_INSTALL_DIRECTORY_SEGMENTS = ["Esposter", "Host"] as const;
