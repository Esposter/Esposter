import { MAX_DEAD_LETTER_REPLAY_ATTEMPTS } from "@/services/constants";
import { formatReplayId } from "@/services/formatReplayId";
import { parseReplayId } from "@/services/parseReplayId";
import { ID_SEPARATOR } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(formatReplayId, () => {
  const eventId = crypto.randomUUID();

  test("suffixes the identity with the attempt", () => {
    expect.hasAssertions();

    expect(formatReplayId({ eventId, replayAttempts: 0 })).toBe(`${eventId}${ID_SEPARATOR}0`);
  });

  test("re-formatting a parsed id replaces the suffix rather than appending", () => {
    expect.hasAssertions();

    const { replayAttempts } = parseReplayId(`${eventId}${ID_SEPARATOR}${MAX_DEAD_LETTER_REPLAY_ATTEMPTS}`);

    expect(formatReplayId({ eventId, replayAttempts: replayAttempts + 1 })).toBe(
      `${eventId}${ID_SEPARATOR}${MAX_DEAD_LETTER_REPLAY_ATTEMPTS + 1}`,
    );
  });
});
