import type { IncomingMessage } from "node:http";

import { normalizeString, takeOne } from "@esposter/shared";

export const getIpAddress = (req: IncomingMessage): string | undefined => {
  const forwardedFor = req.headers["x-forwarded-for"] as string | undefined;
  return normalizeString(takeOne((forwardedFor ?? "").split(","))) || req.socket.remoteAddress;
};
