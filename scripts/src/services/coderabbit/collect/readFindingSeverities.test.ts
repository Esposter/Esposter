import type { ReviewThread } from "#src/models/coderabbit/shared/ReviewThread";
import type { readAnswers as baseReadAnswers } from "#src/services/jev/readAnswers";

import { readFindingSeverities } from "#src/services/coderabbit/collect/readFindingSeverities";
import { CODERABBIT_GRAPHQL_LOGIN } from "#src/services/coderabbit/shared/constants";
import { describe, expect, test, vi } from "vitest";

const { readAnswers } = vi.hoisted(() => ({ readAnswers: vi.fn<typeof baseReadAnswers>() }));

vi.mock(import("#src/services/jev/readAnswers"), () => ({
  readAnswers: readAnswers as unknown as typeof baseReadAnswers,
}));

describe(readFindingSeverities, () => {
  const getThread = (commentId: number): ReviewThread => ({
    body: "body",
    commentId,
    lastAuthorLogin: CODERABBIT_GRAPHQL_LOGIN,
    path: "path",
  });

  test("scores every finding in one call", async () => {
    expect.hasAssertions();

    readAnswers.mockResolvedValue({
      finding1: { score: 0, type: "score" },
      finding2: { score: 2, type: "score" },
    } as never);

    await expect(readFindingSeverities([getThread(1), getThread(2)])).resolves.toStrictEqual(
      new Map([
        [1, 0],
        [2, 2],
      ]),
    );
    expect(readAnswers).toHaveBeenCalledTimes(1);
  });

  // One finding is already in order, and asking costs a round trip to learn that
  test("asks nothing about a single finding", async () => {
    expect.hasAssertions();

    await expect(readFindingSeverities([getThread(1)])).resolves.toBeUndefined();
    expect(readAnswers).not.toHaveBeenCalled();
  });

  // No order is not a failure: the reviewer's own order stands and every finding still reaches the session
  test("answers nothing when the tier answers nothing", async () => {
    expect.hasAssertions();

    readAnswers.mockResolvedValue(undefined);

    await expect(readFindingSeverities([getThread(1), getThread(2)])).resolves.toBeUndefined();
  });
});
