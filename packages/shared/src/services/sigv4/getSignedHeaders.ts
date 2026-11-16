// The names of the headers a signature covers, the host first among them, in code-unit order as SigV4 lists them. A
// `Host` the request names is the URL's, so it is not listed twice
export const getSignedHeaders = (headers: Headers): string[] =>
  ["host", ...[...headers.keys()].filter((name) => name !== "host")].toSorted();
