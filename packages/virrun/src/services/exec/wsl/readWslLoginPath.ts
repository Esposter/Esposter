import { dayjs } from "@/services/dayjs";
import { buildWslLoginShellCommand } from "@/services/exec/wsl/buildWslLoginShellCommand";
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
// Memoized — a login shell's PATH cannot change within a process, and createVirrun would otherwise re-spawn the
// Shell (whose interactive rc startup is not free) on every invocation.
let cachedLoginPath = "";
let isLoginPathCached = false;

export const readWslLoginPath = (): string => {
  if (isLoginPathCached) return cachedLoginPath;
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
  return cachedLoginPath;
};
