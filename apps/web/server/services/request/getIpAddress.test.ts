import type { IncomingMessage } from "node:http";

import { getIpAddress } from "@@/server/services/request/getIpAddress";
import { describe, expect, test } from "vitest";

describe(getIpAddress, () => {
  const address = "0.0.0.0";
  const remoteAddress = "::";
  const createRequest = (forwardedFor?: string) =>
    ({ headers: { "x-forwarded-for": forwardedFor }, socket: { remoteAddress } }) as IncomingMessage;

  // Everything left of the front end's entry is whatever the caller sent, so reading it would let a caller name
  // A new address, and spend a new rate-limit budget, on every request
  test("reads the entry the front end appended rather than one the caller sent", () => {
    expect.hasAssertions();
    expect(getIpAddress(createRequest(`1.1.1.1, ${address}`))).toBe(address);
  });

  test.each([
    [`${address}:1`, address],
    [`[${remoteAddress}]:1`, remoteAddress],
    [`[${remoteAddress}]`, remoteAddress],
  ])("reads %s as %s", (forwardedFor, expectedAddress) => {
    expect.hasAssertions();
    expect(getIpAddress(createRequest(forwardedFor))).toBe(expectedAddress);
  });

  test("keeps a bare IPv6 address whole", () => {
    expect.hasAssertions();
    expect(getIpAddress(createRequest(remoteAddress))).toBe(remoteAddress);
  });

  test("falls back to the socket without a forwarded address", () => {
    expect.hasAssertions();
    expect(getIpAddress(createRequest())).toBe(remoteAddress);
  });
});
