import { DEFAULT_HOSTNAME } from "#src/services/constants";
import { createClaudeAgentSdkDriver } from "#src/services/drivers/claudeAgentSdk/createClaudeAgentSdkDriver";
import { SESSION_SECRET_ENVIRONMENT_VARIABLE } from "#src/services/drivers/window/constants";
import { serveSessionChild } from "#src/services/drivers/window/serveSessionChild";
import { SITE_NAME } from "@esposter/shared";
import { once } from "node:events";
import { WebSocket } from "ws";

// A session's window: takes its secret out of its own environment before anything starts — the session hands that
// Environment to Claude Code and every tool it runs, and a command a repository steers could otherwise read the secret
// And speak to the host as this window — connects back to the host, and serves until the host ends the session or the
// Window closes
export const runSessionChild = async (port: number, writeLine: (line: string) => void): Promise<void> => {
  const secret = process.env[SESSION_SECRET_ENVIRONMENT_VARIABLE] ?? "";
  Reflect.deleteProperty(process.env, SESSION_SECRET_ENVIRONMENT_VARIABLE);
  process.title = `${SITE_NAME} session`;
  const webSocket = new WebSocket(`ws://${DEFAULT_HOSTNAME}:${port}`, {
    headers: { authorization: `Bearer ${secret}` },
  });
  // Served before it opens: the host sends the opening command as soon as it admits the window, and that command can
  // Arrive with the handshake itself
  const serving = serveSessionChild(webSocket, createClaudeAgentSdkDriver, writeLine);
  await once(webSocket, "open");
  writeLine("This window shows one session as it runs. Type to it in the page.\nTo stop it, close this window.\n");
  // Ctrl+C, or closing the window, which Windows reports as SIGHUP, ends the session: the host sees the socket go and
  // Shows the session closed in every page
  const stop = () => {
    webSocket.close();
  };
  process.once("SIGINT", stop);
  process.once("SIGHUP", stop);
  await serving;
};
