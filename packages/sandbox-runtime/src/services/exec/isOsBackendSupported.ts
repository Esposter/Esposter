import { getResult } from "@esposter/shared";
import { execSync } from "node:child_process";
// Whether this host can run the os backend: Linux with bubblewrap on PATH. The platform check
// Short-circuits so the `command -v bwrap` probe (a POSIX shell builtin) only runs where it works —
// On win32 this returns false without spawning anything. getResult turns the probe's non-zero exit
// (bwrap absent) into an Err rather than a throw, per the project's no-try/catch convention.
export const isOsBackendSupported = (): boolean =>
  process.platform === "linux" && getResult(() => execSync("command -v bwrap", { stdio: "pipe" })).isOk();
