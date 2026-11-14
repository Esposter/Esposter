import { getComposerKey } from "@/services/message/composer/getComposerKey";
import { checkHasRoomDraft } from "@/services/message/room/list/checkHasRoomDraft";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(checkHasRoomDraft, () => {
  const roomId = v7();

  test("counts a thread's draft as the draft of the room it is in", () => {
    expect.hasAssertions();

    const threadDraftKey = getComposerKey({ roomId, threadRootId: 1 });

    expect(checkHasRoomDraft([threadDraftKey], roomId)).toBe(true);
  });

  test("has no draft for a room whose drafts are all in other rooms", () => {
    expect.hasAssertions();

    expect(checkHasRoomDraft([v7()], roomId)).toBe(false);
  });
});
