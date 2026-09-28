import { getRemoteHostname } from "@/services/agentConsole/getRemoteHostname";

// What a connection is called wherever the page names it: this computer's host, or the machine it runs on
export const getConnectionName = (address: string): string => {
  const remoteHostname = getRemoteHostname(address);
  return remoteHostname ? `The host on ${remoteHostname}` : "This computer's host";
};
