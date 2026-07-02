import { dayjs } from "@/services/dayjs";
import { VIRRUN_FORCE_PROBE_KEY, WSL_LOGIN_PATH_CACHE_FILENAME } from "@/services/exec/util/constants";
import { getHostFingerprint } from "@/services/exec/util/getHostFingerprint";
import { buildWslLoginShellCommand } from "@/services/exec/wsl/buildWslLoginShellCommand";
import { readWslEnvironmentCache } from "@/services/exec/wsl/readWslEnvironmentCache";
import { writeWslEnvironmentCache } from "@/services/exec/wsl/writeWslEnvironmentCache";
import { getResult } from "@esposter/shared";
import { execFileSync } from "node:child_process";
// Markers bracketing the printed PATH so an interactive rc that writes to stdout itself (prompts, MOTD, version
// Manager banners…) can't corrupt the result — we slice strictly between them and treat their absence as "no
// PATH captured".
const PATH_BEGIN = "__VIRRUN_LOGIN_PATH_BEGIN__";
const PATH_END = "__VIRRUN_LOGIN_PATH_END__";
// Cap the interactive-login capture: a blocking rc/profile (a prompt, a hung version-manager hook) would
// Otherwise stall createVirrun indefinitely. On timeout execFileSync throws, getResult turns it into "", and the
// Command falls back to the default PATH — the same degraded path as a missing WSL.
const WSL_LOGIN_PATH_TIMEOUT_MS = dayjs.duration(5, "seconds").asMilliseconds();
// Run a marked `printf $PATH` inside the user's real login + interactive shell (buildWslLoginShellCommand), so it
// Sources the exact profile + rc files a real terminal would — that is where a version manager (fnm, nvm, asdf,
// Volta…) activates and puts node on PATH, invisible to the bare `wsl.exe --exec` the os backend uses. Capturing
// The resulting PATH lets virrun mirror the user's real terminal environment with zero config — no per-machine
// Setup field. The markers let us slice the PATH out even when the rc prints its own banner.
const CAPTURE_SCRIPT = buildWslLoginShellCommand(`printf "${PATH_BEGIN}%s${PATH_END}" "$PATH"`);
// Captures the PATH a WSL interactive login shell sees, so the os backend can run profile-bound toolchains.
// GetResult turns a missing WSL/shell (or a non-zero exit) into "" rather than a throw: the caller then injects
// Nothing and the command runs under the default PATH, so a broken capture degrades to today's behaviour.
// Three-tier so a fresh `virrun -- <cmd>` process (one per command) never re-pays the interactive-login capture on a
// Warm host: the in-process memo short-circuits repeat calls within a run; the persisted cross-process cache
// (getHostFingerprint-keyed, so it self-invalidates on a kernel change) reuses a prior process's PATH — the real win,
// Since the capture is otherwise a login-shell spawn whose rc startup is not free. VIRRUN_FORCE_PROBE bypasses the
// Persisted cache (not the in-process memo, which is always sound). Only a successful (non-empty) capture is
// Persisted, so a transient WSL/shell failure returns "" and re-probes next process rather than caching the default.
let cachedLoginPath = "";
let isLoginPathCached = false;

export const readWslLoginPath = (): string => {
  if (isLoginPathCached) return cachedLoginPath;
  const key = getHostFingerprint();
  if (process.env[VIRRUN_FORCE_PROBE_KEY] === undefined) {
    const cached = readWslEnvironmentCache(WSL_LOGIN_PATH_CACHE_FILENAME, key);
    if (cached !== undefined) {
      cachedLoginPath = cached;
      isLoginPathCached = true;
      return cached;
    }
  }
  cachedLoginPath = getResult(() =>
    execFileSync("wsl.exe", ["--exec", "sh", "-c", CAPTURE_SCRIPT], {
      encoding: "utf8",
      stdio: "pipe",
      timeout: WSL_LOGIN_PATH_TIMEOUT_MS,
    }),
  )
    .map((stdout) => {
      const beginIndex = stdout.indexOf(PATH_BEGIN);
      const endIndex = stdout.indexOf(PATH_END);
      if (beginIndex === -1 || endIndex === -1 || endIndex < beginIndex) return "";
      return stdout.slice(beginIndex + PATH_BEGIN.length, endIndex);
    })
    .unwrapOr("");
  isLoginPathCached = true;
  if (cachedLoginPath !== "") writeWslEnvironmentCache(WSL_LOGIN_PATH_CACHE_FILENAME, { key, value: cachedLoginPath });
  return cachedLoginPath;
};
