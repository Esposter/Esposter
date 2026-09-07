import type { IncomingMessage } from "node:http";

import { normalizeString, takeOne } from "@esposter/shared";

export const getIpAddress = (req: IncomingMessage): string | undefined => {
  const rawForwardedFor = req.headers["x-forwarded-for"];
  const forwardedFor = Array.isArray(rawForwardedFor) ? takeOne(rawForwardedFor) : rawForwardedFor;
  return normalizeString(takeOne((forwardedFor ?? "").split(","))) || req.socket.remoteAddress;
};
