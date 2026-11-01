import { getPort } from "@/services/agentConsole/getPort";
import { getRemoteHostname } from "@/services/agentConsole/getRemoteHostname";

// On this computer another program can hold a port beside the host's and relay the challenge to it, so the port the host
// Answered on must be the one the page reached. A remote host is reached through its own certificate, often on a port its
// Proxy forwards from, so its proof alone is what vouches for it
export const checkIsProofPortMismatched = (address: string, port: number): boolean =>
  !getRemoteHostname(address) && port !== getPort(address);
