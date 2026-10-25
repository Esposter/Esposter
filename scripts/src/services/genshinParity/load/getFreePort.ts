import { InvalidOperationError, Operation } from "@esposter/shared";
import { createServer } from "node:net";

// A port nothing listens on at the moment of asking, which the server then takes
export const getFreePort = (): Promise<number> =>
  new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, () => {
      const address = server.address();
      server.close(() => {
        if (typeof address === "object" && address) resolve(address.port);
        else reject(new InvalidOperationError(Operation.Create, "a port", "none was given"));
      });
    });
  });
