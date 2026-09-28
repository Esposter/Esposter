const LOOPBACK_HOSTNAMES = new Set(["127.0.0.1", "[::1]", "localhost"]);
// The computer a pairing link points at when it is not this one, so the reader is warned before connecting to it; an
// Address on this computer, or one that does not parse, needs no warning and gives ""
export const getRemoteHostname = (hostUrl: string): string => {
  if (!URL.canParse(hostUrl)) return "";
  const { hostname } = new URL(hostUrl);
  return LOOPBACK_HOSTNAMES.has(hostname) ? "" : hostname;
};
