import { spawnHidden } from "@/services/exec/util/spawnHidden";
import { noop } from "@esposter/shared";
// Fire-and-forget a hidden background child — the shared wsl.exe reaper/teardown pattern: swallow its async `error`
// (best-effort teardown must never surface) and unref so the parent can exit while it runs. A synchronous spawn throw
// (e.g. wsl.exe missing) is intentionally NOT caught here — it propagates to the caller's getResult / signal guard.
//
// Deliberately NOT `detached`: on win32 `detached` (the DETACHED_PROCESS CreateProcess flag) makes Windows ignore
// `windowsHide` (CREATE_NO_WINDOW), so the child flashes an empty console window every time (nodejs/node#21825) — the
// Regression this file exists to prevent. windowsHide alone already gives the child its own windowless console, which
// Both hides it AND isolates it from the parent console's Ctrl+C, so unref is all that's needed to outlive the run.
export const spawnBackground = (file: string, args: readonly string[]): void => {
  const child = spawnHidden(file, args, { stdio: "ignore" });
  child.on("error", noop);
  child.unref();
};
