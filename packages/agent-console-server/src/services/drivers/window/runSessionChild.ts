import { DEFAULT_HOSTNAME } from "#src/services/constants";
import { getStateDirectory } from "#src/services/device/getStateDirectory";
import { createClaudeAgentSdkDriver } from "#src/services/drivers/claudeAgentSdk/createClaudeAgentSdkDriver";
import { SESSION_SECRET_ENVIRONMENT_VARIABLE } from "#src/services/drivers/window/constants";
import { readSessionWindows } from "#src/services/drivers/window/readSessionWindows";
import { serveSessionChild } from "#src/services/drivers/window/serveSessionChild";
import { SITE_NAME } from "@esposter/shared";
import { WebSocket } from "ws";

// A session's window: takes its secret out of its own environment before anything starts — the session hands that
// Environment to Claude Code and every tool it runs, and a command a repository steers could otherwise read the secret
// And speak to the host as this window — connects back to the host, and serves until the host ends the session or the
// Window closes. The first connection goes to the port the host launched it with; a host started since listens on a
// Port of its own, which the window reads from the state directory each time it tries again
export const runSessionChild = async (port: number, writeLine: (line: string) => void): Promise<void> => {
  const secret = process.env[SESSION_SECRET_ENVIRONMENT_VARIABLE] ?? "";
  Reflect.deleteProperty(process.env, SESSION_SECRET_ENVIRONMENT_VARIABLE);
  process.title = `${SITE_NAME} session`;
  const stateDirectory = getStateDirectory();
  let isFirstConnection = true;
  const connect = () => {
    const hostPort = isFirstConnection ? port : readSessionWindows(stateDirectory).port;
    isFirstConnection = false;
    return new WebSocket(`ws://${DEFAULT_HOSTNAME}:${hostPort}`, { headers: { authorization: `Bearer ${secret}` } });
  };
  // Ctrl+C, or closing the window, which Windows reports as SIGHUP, ends the session: the host sees the socket go and
  // Shows the session closed in every page
  const abortController = new AbortController();
  const stop = () => {
    abortController.abort();
  };
  process.once("SIGINT", stop);
  process.once("SIGHUP", stop);
  writeLine("This window shows one session as it runs. Type to it in the page.\nTo stop it, close this window.\n");
  await serveSessionChild(connect, createClaudeAgentSdkDriver, writeLine, abortController.signal);
};
