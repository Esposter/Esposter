export const DEFAULT_APP_ORIGIN = "https://esposter.com";
// Loopback only unless the person starting the host says otherwise — a host reachable from the network is a
// Decision, never a default
export const DEFAULT_HOSTNAME = "127.0.0.1";
// Fixed so the page can look for a host on the loopback before anything is paired
export const DEFAULT_PORT = 7437;
// The page's URL fragment that carries a host's address on the link the host prints, read and cleared on load
export const PAIRING_HASH_PARAMETER = "host";
export const TOKEN_QUERY_PARAMETER = "token";
