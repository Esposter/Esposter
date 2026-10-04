import { normalizeString } from "@esposter/shared";

const PORTED_IPV4_ADDRESS_REGEX = /^(?<address>\d{1,3}(?:\.\d{1,3}){3}):\d+$/u;
const BRACKETED_IPV6_ADDRESS_REGEX = /^\[(?<address>[^\]]+)\](?::\d+)?$/u;
// The rightmost entry is the one the platform's front end appended, the only hop in front of the app, so it is the
// Only one a client cannot write: every entry left of it arrived in the request, and keying a rate limit on one of
// Those lets a caller mint a fresh budget per request. A front end may write it with the client's port, which would
// Make every connection its own key, so the port is dropped
export const getIpAddress = (headers: Headers, remoteAddress: string): string => {
  const forwardedFor = headers.get("x-forwarded-for") ?? "";
  const lastHop = normalizeString(forwardedFor.split(",").at(-1) ?? "");
  const address =
    PORTED_IPV4_ADDRESS_REGEX.exec(lastHop)?.groups?.address ??
    BRACKETED_IPV6_ADDRESS_REGEX.exec(lastHop)?.groups?.address ??
    lastHop;
  return address || remoteAddress;
};
