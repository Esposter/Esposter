import { checkIsMuted } from "#src/services/checkIsMuted";
import { WARM_SCRIPT_PATH } from "#src/services/constants";
import { readLanguage } from "#src/services/readLanguage";
import { spawn } from "node:child_process";

// The session-start hook's stdout is the model's context, so it waits on nothing: the warm request goes out from
// A detached process, and only once a voice is set up and not muted, since otherwise there is nothing to wake
export const spawnWarm = (name: string): void => {
  if (!readLanguage() || checkIsMuted()) return;

  spawn(process.execPath, [WARM_SCRIPT_PATH, name], { detached: true, stdio: "ignore", windowsHide: true }).unref();
};
