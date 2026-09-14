import type { ReplayId } from "#src/models/deadLetter/ReplayId";

import { MAX_DEAD_LETTER_REPLAY_ATTEMPTS } from "#src/services/deadLetter/constants";
import { parseReplayId } from "#src/services/deadLetter/parseReplayId";
import { ID_SEPARATOR } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(parseReplayId, () => {
  const eventId = crypto.randomUUID();

  test("id without a suffix has never been replayed", () => {
    expect.hasAssertions();

    expect(parseReplayId(eventId)).toStrictEqual({ eventId, replayAttempts: 0 } satisfies ReplayId);
  });

  test("id with a suffix splits into identity and attempts", () => {
    expect.hasAssertions();

    expect(parseReplayId(`${eventId}${ID_SEPARATOR}${MAX_DEAD_LETTER_REPLAY_ATTEMPTS}`)).toStrictEqual({
      eventId,
      replayAttempts: MAX_DEAD_LETTER_REPLAY_ATTEMPTS,
    } satisfies ReplayId);
  });

  test("id with a non-numeric suffix is a plain id", () => {
    expect.hasAssertions();

    const id = `${eventId}${ID_SEPARATOR}${Number.NaN}`;

    expect(parseReplayId(id)).toStrictEqual({ eventId: id, replayAttempts: 0 } satisfies ReplayId);
  });
});
