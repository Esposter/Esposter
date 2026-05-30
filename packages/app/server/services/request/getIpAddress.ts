import type { Context } from "@@/server/trpc/context";

import { normalizeString, takeOne } from "@esposter/shared";

export const getIpAddress = (req: NonNullable<Context["req"]>): string | undefined => {
  const rawForwardedFor = req.headers["x-forwarded-for"];
  const forwardedFor = Array.isArray(rawForwardedFor) ? takeOne(rawForwardedFor) : rawForwardedFor;
  return normalizeString(takeOne((forwardedFor ?? "").split(","))) || req.socket.remoteAddress;
};
