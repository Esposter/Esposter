import type { WslLoginEnvironment } from "@/models/exec/wsl/WslLoginEnvironment";

import { dayjs } from "@/services/dayjs";
import { VIRRUN_FORCE_PROBE_KEY, WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME } from "@/services/exec/util/constants";
import { execFileHidden } from "@/services/exec/util/execFileHidden";
import { getHostFingerprint } from "@/services/exec/util/getHostFingerprint";
import { buildWslLoginShellCommand } from "@/services/exec/wsl/buildWslLoginShellCommand";
import {
  VIRRUN_LOGIN_NODE_BEGIN_MARKER,
  VIRRUN_LOGIN_NODE_END_MARKER,
  VIRRUN_LOGIN_PATH_BEGIN_MARKER,
  VIRRUN_LOGIN_PATH_END_MARKER,
} from "@/services/exec/wsl/constants";
import { readWslLoginEnvironmentCache } from "@/services/exec/wsl/readWslLoginEnvironmentCache";
import { sliceBetweenMarkers } from "@/services/exec/wsl/sliceBetweenMarkers";
import { writeWslEnvironmentCache } from "@/services/exec/wsl/writeWslEnvironmentCache";
import { getResult } from "@esposter/shared";
// Cap the interactive-login capture: a blocking rc/profile (a prompt, a hung version-manager hook) would
// Otherwise stall createVirrun indefinitely. On timeout execFileSync throws, getResult turns it into the empty
// Environment, and the command falls back to the default PATH — the same degraded path as a missing WSL.
const WSL_LOGIN_ENVIRONMENT_TIMEOUT_MS = dayjs.duration(5, "seconds").asMilliseconds();
const EMPTY_LOGIN_ENVIRONMENT: WslLoginEnvironment = { nodeVersion: "", path: "" };
// Run a marked capture inside the user's real login + interactive shell (buildWslLoginShellCommand), so it sources the
// Exact profile + rc files a real terminal would — that is where a version manager (fnm, nvm, asdf, Volta…) activates
// And puts node on PATH, invisible to the bare `wsl.exe --exec` the os backend uses. Capturing the resulting PATH lets
// Virrun mirror the user's real terminal environment with zero config — no per-machine setup field.
//
// Before printing, prepend the *stable* directory that holds `node`: fnm activates by putting an ephemeral
// `/run/user/<uid>/fnm_multishells/<pid>_<ts>/bin` (a per-shell symlink dir) on PATH, which fnm's exit hook deletes
// The instant this capture shell ends — so the raw captured entry is already dead by the time the sandbox (or a
// Later process reading the persisted cache) runs the command, giving `corepack: command not found` (exit 127).
// `readlink -f` dereferences that ephemeral symlink to its backing install dir (…/fnm/node-versions/vX/installation/
// Bin, which also carries corepack/npm/pnpm) and we lead PATH with it. Idempotent for stable managers (nvm/volta):
// `readlink -f` on an already-real path is a no-op and re-prepending a dir already on PATH is harmless.
//
// The same shell also reports that node's version, which is the version the sandbox actually runs — the host process's
// Own `process.version` is the Windows node and says nothing about the guest toolchain.
const CAPTURE_SCRIPT = buildWslLoginShellCommand(
  [
    `nodeBin="$(command -v node 2>/dev/null)"`,
    `[ -n "$nodeBin" ] && PATH="$(dirname "$(readlink -f "$nodeBin")"):$PATH"`,
    `nodeVersion="$(node --version 2>/dev/null)"`,
    `printf "${VIRRUN_LOGIN_PATH_BEGIN_MARKER}%s${VIRRUN_LOGIN_PATH_END_MARKER}${VIRRUN_LOGIN_NODE_BEGIN_MARKER}%s${VIRRUN_LOGIN_NODE_END_MARKER}" "$PATH" "$nodeVersion"`,
  ].join("; "),
);
// Captures the environment a WSL interactive login shell sees, so the os backend can run profile-bound toolchains and
// Key its caches on the node the sandbox will really use. GetResult turns a missing WSL/shell (or a non-zero exit)
// Into the empty environment rather than a throw: the caller then injects nothing and the command runs under the
// Default PATH, so a broken capture degrades to today's behaviour.
// Three-tier so a fresh `virrun -- <cmd>` process (one per command) never re-pays the interactive-login capture on a
// Warm host: the in-process memo short-circuits repeat calls within a run; the persisted cross-process cache
// (getHostFingerprint-keyed, so it self-invalidates on a kernel change, and age-bounded so a toolchain switch the
// Fingerprint can't see self-heals within WSL_ENVIRONMENT_MAX_AGE_MS) reuses a prior process's capture — the
// Real win, since the capture is otherwise a login-shell spawn whose rc startup is not free. VIRRUN_FORCE_PROBE
// Bypasses the persisted cache (not the in-process memo, which is always sound). Only a successful (non-empty
// PATH) capture is persisted, so a transient WSL/shell failure re-probes next process rather than caching the default.
let cachedLoginEnvironment = EMPTY_LOGIN_ENVIRONMENT;
let isLoginEnvironmentCached = false;

export const readWslLoginEnvironment = (): WslLoginEnvironment => {
  if (isLoginEnvironmentCached) return cachedLoginEnvironment;
  const key = getHostFingerprint();
  if (process.env[VIRRUN_FORCE_PROBE_KEY] === undefined) {
    const cached = readWslLoginEnvironmentCache();
    if (cached !== undefined) {
      cachedLoginEnvironment = cached;
      isLoginEnvironmentCached = true;
      return cached;
    }
  }
  cachedLoginEnvironment = getResult(() =>
    execFileHidden("wsl.exe", ["--exec", "sh", "-c", CAPTURE_SCRIPT], { timeout: WSL_LOGIN_ENVIRONMENT_TIMEOUT_MS }),
  )
    .map((stdout) => ({
      nodeVersion: sliceBetweenMarkers(stdout, VIRRUN_LOGIN_NODE_BEGIN_MARKER, VIRRUN_LOGIN_NODE_END_MARKER),
      path: sliceBetweenMarkers(stdout, VIRRUN_LOGIN_PATH_BEGIN_MARKER, VIRRUN_LOGIN_PATH_END_MARKER),
    }))
    .unwrapOr(EMPTY_LOGIN_ENVIRONMENT);
  isLoginEnvironmentCached = true;
  if (cachedLoginEnvironment.path)
    writeWslEnvironmentCache(WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME, { key, value: cachedLoginEnvironment });
  return cachedLoginEnvironment;
};
