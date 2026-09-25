import {
  DEFAULT_APP_ORIGIN,
  DEFAULT_HOSTNAME,
  DEFAULT_PORT,
  PAIRING_HASH_PARAMETER,
  TOKEN_QUERY_PARAMETER,
} from "#src/services/constants";
import { createClaudeAgentSdkDriver } from "#src/services/drivers/claudeAgentSdk/createClaudeAgentSdkDriver";
import { createAgentConsoleServer } from "#src/services/server/createAgentConsoleServer";
import { readToken } from "#src/services/server/readToken";
import { RoutePath } from "@esposter/shared";
import { once } from "node:events";
import { hostname as getMachineName } from "node:os";
import { parseArgs } from "node:util";

// `agent-console-server [--port <port>] [--hostname <address>] [--origin <app origin>]` — starts the host and
// Prints the link that pairs a page with it. `--hostname 0.0.0.0` is what lets another machine reach it.
const { values } = parseArgs({
  options: {
    hostname: { default: DEFAULT_HOSTNAME, type: "string" },
    origin: { default: DEFAULT_APP_ORIGIN, type: "string" },
    port: { default: String(DEFAULT_PORT), type: "string" },
  },
});
const token = readToken();
const server = await createAgentConsoleServer({
  createDriver: (callbacks) => createClaudeAgentSdkDriver(callbacks),
  hostname: values.hostname,
  port: Number(values.port),
  token,
});
// A host listening on every interface is reached by the machine's own name, not the wildcard it bound
const reachableHostname = values.hostname === "0.0.0.0" ? getMachineName() : values.hostname;
const hostUrl = `ws://${reachableHostname}:${server.port}/?${TOKEN_QUERY_PARAMETER}=${token}`;
const pairingUrl = `${values.origin}${RoutePath.AgentConsole}#${PAIRING_HASH_PARAMETER}=${encodeURIComponent(hostUrl)}`;
process.stdout.write(
  `Agent console host listening on ${reachableHostname}:${server.port}\n\nOpen to pair:\n  ${pairingUrl}\n\nOr paste this host URL into the page:\n  ${hostUrl}\n`,
);

// Ctrl+C closes every session's Claude Code process before the host goes, rather than leaving them orphaned
await once(process, "SIGINT");
await server.close();
