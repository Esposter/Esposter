import { auth } from "@@/server/auth";
import { readSession } from "@@/server/services/auth/readSession";
import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import { describe, expect, test, vi } from "vitest";

describe(readSession, () => {
  test("forwards the extended session cookie onto the response", async () => {
    expect.hasAssertions();

    const cookie = "cookie";
    vi.spyOn(Headers.prototype, "getSetCookie").mockReturnValueOnce([cookie]);
    const response = new ServerResponse(new IncomingMessage(new Socket()));
    await readSession(new Headers(), response);

    expect(response.getHeader("Set-Cookie")).toStrictEqual([cookie]);
  });

  test("leaves the extension alone with no response to carry its cookie", async () => {
    expect.hasAssertions();

    const getSession = vi.spyOn(auth.api, "getSession");
    const headers = new Headers();
    await readSession(headers);

    expect(getSession).toHaveBeenCalledExactlyOnceWith({ headers, query: { disableRefresh: true } });
  });
});
