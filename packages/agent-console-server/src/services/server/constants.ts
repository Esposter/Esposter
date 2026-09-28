// Where the pairing token is kept between runs: a page paired once stays paired across restarts of the host
export const TOKEN_DIRECTORY_NAME = ".agent-console-server";
export const TOKEN_FILENAME = "token";
export const TOKEN_BYTE_LENGTH = 32;
// How long a host already on the port has to accept a connection before whatever holds the port is taken for another
// Program
export const HOST_PROBE_TIMEOUT_MS = 2000;
// The header a probe sends its challenge in: the host answers with the challenge signed by its token, so a port's
// Holder is proven to be the host without the token ever leaving this process
export const HOST_CHALLENGE_HEADER = "x-agent-console-challenge";
