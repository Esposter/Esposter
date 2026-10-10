import { describe, expect, test } from "vitest";

import { WARD_WINDOW_MS } from "../constants";
import { getCheckoutPeer } from "./getCheckoutPeer";

describe(getCheckoutPeer, () => {
  const CHECKOUT_ROOT = String.raw`C:\Users\jimmy\checkout`;
  const EDITED_PATH = String.raw`C:\Users\jimmy\checkout\packages\genshin-mods\src\register.ts`;
  const OWN_SESSION_ID = "own";
  const PEER_SESSION_ID = "peer";
  const NOW = WARD_WINDOW_MS * 10;

  test("refuses nothing with no peer session, the checkout's own edits alone", () => {
    expect.hasAssertions();

    expect(
      getCheckoutPeer(
        { [EDITED_PATH]: { editedAt: NOW, sessionId: OWN_SESSION_ID } },
        CHECKOUT_ROOT,
        OWN_SESSION_ID,
        NOW,
      ),
    ).toBeUndefined();
  });

  test("names the peer's edited path inside the checkout", () => {
    expect.hasAssertions();

    expect(
      getCheckoutPeer(
        { [EDITED_PATH]: { editedAt: NOW, sessionId: PEER_SESSION_ID } },
        CHECKOUT_ROOT,
        OWN_SESSION_ID,
        NOW,
      ),
    ).toBe(EDITED_PATH);
  });

  test("skips a peer whose edit is outside this checkout", () => {
    expect.hasAssertions();

    expect(
      getCheckoutPeer(
        { [String.raw`D:\Other\checkout\file.ts`]: { editedAt: NOW, sessionId: PEER_SESSION_ID } },
        CHECKOUT_ROOT,
        OWN_SESSION_ID,
        NOW,
      ),
    ).toBeUndefined();
  });

  test("skips a peer whose edit is past the window", () => {
    expect.hasAssertions();

    expect(
      getCheckoutPeer(
        { [EDITED_PATH]: { editedAt: NOW - WARD_WINDOW_MS, sessionId: PEER_SESSION_ID } },
        CHECKOUT_ROOT,
        OWN_SESSION_ID,
        NOW,
      ),
    ).toBeUndefined();
  });
});
