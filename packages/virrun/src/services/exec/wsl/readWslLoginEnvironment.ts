import type { WslLoginEnvironment } from "#src/models/exec/wsl/WslLoginEnvironment";

import {
  WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME,
  WSL_LOGIN_ENVIRONMENT_TIMEOUT_MS,
} from "#src/services/exec/util/constants";
import { createProbeCache } from "#src/services/exec/util/createProbeCache";
import { buildWslLoginShellCommand } from "#src/services/exec/wsl/buildWslLoginShellCommand";
import {
  VIRRUN_LOGIN_NODE_BEGIN_MARKER,
  VIRRUN_LOGIN_NODE_END_MARKER,
  VIRRUN_LOGIN_PATH_BEGIN_MARKER,
  VIRRUN_LOGIN_PATH_END_MARKER,
  WINDOWS_DRIVE_MOUNT_REGEX,
  WSL_PATH_DELIMITER,
} from "#src/services/exec/wsl/constants";
import { execWsl } from "#src/services/exec/wsl/execWsl";
import { getSandboxLoginPath } from "#src/services/exec/wsl/getSandboxLoginPath";
import { readWslLoginEnvironmentCache } from "#src/services/exec/wsl/readWslLoginEnvironmentCache";
import { sliceBetweenMarkers } from "#src/services/exec/wsl/sliceBetweenMarkers";
import { writeWslEnvironmentCache } from "#src/services/exec/wsl/writeWslEnvironmentCache";
import { getResult, takeOne } from "@esposter/shared";

const EMPTY_LOGIN_ENVIRONMENT: WslLoginEnvironment = { nodeDirectory: "", nodeVersion: "", path: "" };
// Run a marked capture inside the user's real login + interactive shell (buildWslLoginShellCommand), so it sources the
// Exact profile + rc files a real terminal would — that is where a version manager (fnm, nvm, asdf, Volta…) activates
// And puts node on PATH, invisible to the bare `wsl.exe --exec` the os backend uses. Capturing the resulting PATH lets
// Virrun mirror the user's real terminal environment with zero config — no per-machine setup field.
//
// Before printing, prepend the directory of the node binary itself, asked of node (`process.execPath`) rather than read
// Off PATH. What PATH holds is a version manager's indirection, never the install: fnm's per-shell
// `/run/user/<uid>/fnm_multishells/<pid>_<ts>/bin` is deleted by fnm's exit hook the instant this capture shell ends,
// And a shim manager's (vp, Volta) `node` is a symlink to the manager's own binary, which the Windows side cannot follow
// Over the 9p bridge. The real install directory survives both and holds a real `node` file, the one that
// `checkHasSandboxNode` stats later; re-prepending a directory already on PATH (nvm) is harmless. `pnpm` is not looked
// Up here: it resolves through the rest of the captured PATH, from whichever shim or install put it there.
//
// The same shell also reports that node's version, which is the version the sandbox actually runs — the host process's
// Own `process.version` is the Windows node and says nothing about the guest toolchain.
const CAPTURE_SCRIPT = buildWslLoginShellCommand(
  [
    `nodeBin="$(node -p process.execPath 2>/dev/null)"`,
    `[ -n "$nodeBin" ] && PATH="$(dirname "$nodeBin"):$PATH"`,
    `nodeVersion="$(node --version 2>/dev/null)"`,
    `printf "${VIRRUN_LOGIN_PATH_BEGIN_MARKER}%s${VIRRUN_LOGIN_PATH_END_MARKER}${VIRRUN_LOGIN_NODE_BEGIN_MARKER}%s${VIRRUN_LOGIN_NODE_END_MARKER}" "$PATH" "$nodeVersion"`,
  ].join("; "),
);
// Captures the environment a WSL interactive login shell sees, so the os backend can run profile-bound toolchains and
// Key its caches on the node the sandbox will really use. GetResult turns a missing WSL/shell (or a non-zero exit)
// Into the empty environment rather than a throw: the caller then injects nothing and the command runs under the
// Default PATH, so a broken capture degrades to today's behaviour. The persisted tier is the real win — the capture
// Is otherwise a login-shell spawn whose rc startup is not free. Only a capture that answered both questions is
// Persisted, so a transient WSL/shell failure re-probes next process rather than caching the default. Both, because
// A capture that resolved a PATH but no node the sandbox could run still fails every run through it —
// `getSandboxNodeVersion` reports "" and computeEnvironmentKey refuses to key on it — and persisting that pins the
// Failure for the cache's whole age bound, across processes, with no run able to recover on its own.
export const readWslLoginEnvironment: () => WslLoginEnvironment = createProbeCache({
  probe: () =>
    getResult(() => execWsl(["--exec", "sh", "-c", CAPTURE_SCRIPT], { timeout: WSL_LOGIN_ENVIRONMENT_TIMEOUT_MS }))
      .map((stdout) => {
        const capturedPath = sliceBetweenMarkers(stdout, VIRRUN_LOGIN_PATH_BEGIN_MARKER, VIRRUN_LOGIN_PATH_END_MARKER);
        const nodeVersion = sliceBetweenMarkers(stdout, VIRRUN_LOGIN_NODE_BEGIN_MARKER, VIRRUN_LOGIN_NODE_END_MARKER);
        const path = getSandboxLoginPath(capturedPath);
        // The script above leads the captured PATH with the dereferenced directory of the node it then ran, so a
        // Reported version names that entry as the install to check later (checkHasSandboxNode).
        const nodeDirectory = takeOne(capturedPath.split(WSL_PATH_DELIMITER), 0);
        // A node the login shell resolved under a Windows drive mount is the HOST's node reached through interop; it
        // Cannot execute in the Linux sandbox, so the shell answered with something no run can use. Report no node at
        // All rather than a version the sandbox will never run: "" is what stops the capture being persisted and what
        // `computeEnvironmentKey` refuses to key on, while the version would mint a plausible key for an absent node.
        return nodeVersion && !WINDOWS_DRIVE_MOUNT_REGEX.test(nodeDirectory)
          ? { nodeDirectory, nodeVersion, path }
          : { nodeDirectory: "", nodeVersion: "", path };
      })
      .unwrapOr(EMPTY_LOGIN_ENVIRONMENT),
  readPersistedCache: readWslLoginEnvironmentCache,
  shouldPersist: ({ nodeDirectory, path }) => Boolean(nodeDirectory && path),
  writePersistedCache: (cache) => {
    writeWslEnvironmentCache(WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME, cache);
  },
});
