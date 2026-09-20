import type { ChildProcess } from "node:child_process";

import { VOICE_SERVER_SCRIPT_PATH } from "#src/services/constants";
import { spawn } from "node:child_process";

// The resident synthesizer, detached with its streams closed so the hook that spawned it can exit; the child is
// Still watched while the hook lives, so a load that dies is seen rather than retried against
export const spawnVoiceServer = (): ChildProcess => {
  const child = spawn(process.execPath, [VOICE_SERVER_SCRIPT_PATH], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  child.unref();
  return child;
};
