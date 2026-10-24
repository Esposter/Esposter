import { getComposerKey } from "@/services/message/composer/getComposerKey";
import { checkHasRoomDraft } from "@/services/message/room/list/checkHasRoomDraft";
import { getReverseTickedTimestamp } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(checkHasRoomDraft, () => {
  const roomId = crypto.randomUUID();

  test("counts a thread's draft as the draft of the room it is in", () => {
    expect.hasAssertions();

    const threadDraftKey = getComposerKey({ roomId, threadRootRowKey: getReverseTickedTimestamp() });

    expect(checkHasRoomDraft([threadDraftKey], roomId)).toBe(true);
  });

  test("has no draft for a room whose drafts are all in other rooms", () => {
    expect.hasAssertions();

    expect(checkHasRoomDraft([crypto.randomUUID()], roomId)).toBe(false);
  });
});
