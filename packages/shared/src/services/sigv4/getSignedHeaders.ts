import { SIGV4_HOST_HEADER } from "#src/services/sigv4/constants";

// The names of the headers a signature covers, the host first among them, in code-unit order as SigV4 lists them. A
// `Host` the request names is the URL's, so it is not listed twice
export const getSignedHeaders = (headers: Headers): string[] =>
  [SIGV4_HOST_HEADER, ...[...headers.keys()].filter((name) => name !== SIGV4_HOST_HEADER)].toSorted();
