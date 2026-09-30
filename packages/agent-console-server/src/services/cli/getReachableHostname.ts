import { hostname as getMachineName } from "node:os";

// A host listening on every interface is reached by the machine's own name, not the wildcard it bound
export const getReachableHostname = (hostname: string): string =>
  hostname === "0.0.0.0" ? getMachineName() : hostname;
