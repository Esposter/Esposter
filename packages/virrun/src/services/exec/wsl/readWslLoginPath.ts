import { getResult } from "@esposter/shared";
import { execFileSync } from "node:child_process";
// Markers bracketing the printed PATH so an interactive rc that writes to stdout itself (prompts, MOTD, version
// Manager banners…) can't corrupt the result — we slice strictly between them and treat their absence as "no
// PATH captured".
const PATH_BEGIN = "__VIRRUN_LOGIN_PATH_BEGIN__";
const PATH_END = "__VIRRUN_LOGIN_PATH_END__";
// Resolve the user's own login shell (prefer $SHELL, fall back to the passwd entry, then /bin/sh) and run it as a
// Login + interactive shell, so it sources the exact profile + rc files a real terminal would (~/.zprofile,
// ~/.zshrc, ~/.bash_profile, ~/.bashrc…). That is where a version manager (fnm, nvm, asdf, volta…) activates and
// Puts node on PATH — and it is invisible to the bare `wsl.exe --exec` the os backend uses, which sources none of
// Them. -i is required, not just -l: zsh/bash only source the interactive rc (~/.zshrc, ~/.bashrc) when
// Interactive, and activation usually lives there. Capturing the resulting PATH lets virrun mirror the user's
// Real terminal environment with zero config — no per-machine setup field.
const CAPTURE_SCRIPT = [
  // oxlint-disable-next-line no-template-curly-in-string -- `${SHELL:-}` is shell parameter expansion, not a JS template placeholder
  'SHELL_BIN="${SHELL:-}"',
  '[ -x "$SHELL_BIN" ] || SHELL_BIN="$(getent passwd "$(id -un)" 2>/dev/null | cut -d: -f7)"',
  '[ -x "$SHELL_BIN" ] || SHELL_BIN=/bin/sh',
  `exec "$SHELL_BIN" -lic 'printf "${PATH_BEGIN}%s${PATH_END}" "$PATH"'`,
].join("; ");
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
    execFileSync("wsl.exe", ["--exec", "sh", "-c", CAPTURE_SCRIPT], { encoding: "utf8", stdio: "pipe" }),
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
