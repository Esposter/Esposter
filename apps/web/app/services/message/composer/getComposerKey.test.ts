import type { ComposerTarget } from "@/models/message/ComposerTarget";

import { getComposerKey } from "@/services/message/composer/getComposerKey";
import { getComposerTarget } from "@/services/message/composer/getComposerTarget";
import { getReverseTickedTimestamp } from "@esposter/db-schema";
import { ID_SEPARATOR } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getComposerKey, () => {
  const roomId = crypto.randomUUID();

  // The drafts page reads composer keys back out of storage, so a key that cannot be split into the room and
  // Thread it came from strands every thread draft it lists
  test("round-trips a thread composer through its key", () => {
    expect.hasAssertions();

    const target: ComposerTarget = { roomId, threadRootRowKey: getReverseTickedTimestamp() };

    expect(getComposerTarget(getComposerKey(target))).toStrictEqual(target);
  });

  // The room composer keys by its bare room id, which is what every draft stored before threads had a composer
  // Of their own is filed under
  test("keys a room composer by its room id alone", () => {
    expect.hasAssertions();

    const target: ComposerTarget = { roomId, threadRootRowKey: "" };

    expect(getComposerKey(target)).toBe(roomId);
    expect(getComposerTarget(roomId)).toStrictEqual(target);
  });

  // A stored key whose thread part is no rowKey names no composer — read as the room's, its draft would be sent
  // To the room rather than the thread it was written in
  test("reads a key with a malformed thread part as no composer", () => {
    expect.hasAssertions();

    expect(getComposerTarget(`${roomId}${ID_SEPARATOR}malformed`)).toBeUndefined();
  });
});
