// The socket scheme for each scheme a reader may type a host's address in
const SocketProtocolMap: Readonly<Record<string, string>> = {
  "http:": "ws:",
  "https:": "wss:",
  "ws:": "ws:",
  "wss:": "wss:",
};

// The socket address a machine's host is reached at, from what the reader typed: an `https://` address, as a host
// Behind its own certificate is usually given, becomes its `wss://` socket, and anything past the host and port goes.
// What does not parse gives "", which pairing refuses as not a host address
export const toHostAddress = (typedAddress: string): string => {
  if (!URL.canParse(typedAddress)) return "";
  const { host, protocol } = new URL(typedAddress);
  const socketProtocol = SocketProtocolMap[protocol];
  return socketProtocol ? `${socketProtocol}//${host}` : "";
};
