import { spawn } from "node:child_process";

// One of the plugin's scripts run under the same node, owned by nobody: the session-start hook's stdout is the
// Model's context, so anything it starts that costs a load or a round trip runs here and the hook waits on nothing
export const spawnDetachedScript = (scriptPath: string, ...args: string[]): void => {
  spawn(process.execPath, [scriptPath, ...args], { detached: true, stdio: "ignore", windowsHide: true }).unref();
};
