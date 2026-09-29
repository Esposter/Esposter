import type { Peer } from "crossws";

import { IncomingMessage } from "node:http";
import { Socket } from "node:net";

// TRPC's WebSocket context factory takes node's request, and crossws hands each peer the upgrade request as a fetch
// `Request`, so the url and headers are carried over onto a detached one
export const toIncomingMessage = ({ request }: Peer): IncomingMessage => {
  const incomingMessage = new IncomingMessage(new Socket());
  const { pathname, search } = new URL(request.url);
  incomingMessage.url = `${pathname}${search}`;
  incomingMessage.headers = Object.fromEntries(request.headers);
  return incomingMessage;
};
