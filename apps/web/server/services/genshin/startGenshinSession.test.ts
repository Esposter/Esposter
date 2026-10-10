import type { GenshinSaveEnvelope } from "#server/models/genshin/GenshinSaveEnvelope";

import { checkIsGenshinSessionCurrent } from "#server/services/genshin/checkIsGenshinSessionCurrent";
import { startGenshinSession } from "#server/services/genshin/startGenshinSession";
import { EMPTY_GENSHIN_SAVE } from "genshin-world/save";
import { describe, expect, test } from "vitest";

describe(startGenshinSession, () => {
  test("a new player starts on the empty save under the session", () => {
    expect.hasAssertions();

    const envelope = startGenshinSession(undefined, "first");

    expect(envelope).toStrictEqual({ save: EMPTY_GENSHIN_SAVE, sessionId: "first" });
  });

  test("a newer session supersedes the older one and keeps the save it started over", () => {
    expect.hasAssertions();

    const firstEnvelope = startGenshinSession(undefined, "first");
    const secondEnvelope = startGenshinSession(firstEnvelope, "second");

    expect(secondEnvelope).toStrictEqual({ previousSessionId: "first", save: EMPTY_GENSHIN_SAVE, sessionId: "second" });
    expect(checkIsGenshinSessionCurrent(secondEnvelope, "first")).toBe(false);
    expect(checkIsGenshinSessionCurrent(secondEnvelope, "second")).toBe(true);
  });
});

describe(checkIsGenshinSessionCurrent, () => {
  test("a save that was never started has no current session", () => {
    expect.hasAssertions();

    expect(checkIsGenshinSessionCurrent(undefined, "first")).toBe(false);
  });

  test("a stale session's write is refused while the current one's is accepted", () => {
    expect.hasAssertions();

    const envelope: GenshinSaveEnvelope = { save: EMPTY_GENSHIN_SAVE, sessionId: "second" };

    expect(checkIsGenshinSessionCurrent(envelope, "first")).toBe(false);
    expect(checkIsGenshinSessionCurrent(envelope, "second")).toBe(true);
  });
});
