import type { Context } from "@@/server/trpc/context";

import { insertCallSessionId } from "@@/server/services/message/call/insertCallSessionId";
import { describe, expect, test } from "vitest";

// Only `returning` is reached, so the chain is stubbed rather than the whole client mocked
const createDb = (returning: () => Promise<{ id: string }[]>) =>
  ({ insert: () => ({ values: () => ({ returning }) }) }) as unknown as Context["db"];

describe(insertCallSessionId, () => {
  const userId = "userId";

  test("returns the id the insert took", async () => {
    expect.hasAssertions();

    const db = createDb(() => Promise.resolve([{ id: "callSessionId" }]));

    await expect(insertCallSessionId(db, { userId })).resolves.toBe("callSessionId");
  });

  test("reports a taken id as no id, so the caller mints another", async () => {
    expect.hasAssertions();

    const db = createDb(() => Promise.reject(Object.assign(new Error("duplicate key"), { code: "23505" })));

    await expect(insertCallSessionId(db, { userId })).resolves.toBeUndefined();
  });

  test("rethrows a failure that is not a collision rather than inviting a retry", async () => {
    expect.hasAssertions();

    // Swallowed, a dead connection burns every attempt and then surfaces as an id-allocation failure, which is
    // The one thing that did not go wrong
    const db = createDb(() => Promise.reject(Object.assign(new Error("connection terminated"), { code: "57P01" })));

    await expect(insertCallSessionId(db, { userId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: connection terminated]`,
    );
  });
});
