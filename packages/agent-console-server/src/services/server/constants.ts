// What the host answers a probe with, so the page can tell it from anything else listening on the port
export const HOST_NAME = "agent-console-server";
// Where the pairing token is kept between runs: a page paired once stays paired across restarts of the host
export const TOKEN_DIRECTORY_NAME = ".agent-console-server";
export const TOKEN_FILENAME = "token";
export const TOKEN_BYTE_LENGTH = 32;
