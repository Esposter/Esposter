import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";

// Nitro's Vite environment carries the dev server its own upgrade listener forwards to, which Vite's types do not know
export interface NitroDevEnvironment {
  devServer: {
    upgrade?: (context: { node: { head: Buffer; req: IncomingMessage; socket: Duplex } }) => Promise<void> | void;
  };
}
