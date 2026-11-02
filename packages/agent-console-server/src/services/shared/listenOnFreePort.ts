import type { Server } from "node:http";

import { DEFAULT_HOSTNAME } from "#src/services/constants";
import { once } from "node:events";

// A test's loopback server on a port nothing else holds, returned once it is listening
export const listenOnFreePort = async (server: Server): Promise<number> => {
  server.listen(0, DEFAULT_HOSTNAME);
  await once(server, "listening");
  const address = server.address();
  return typeof address === "object" && address ? address.port : 0;
};
