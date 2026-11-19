import { createMockObjectState } from "#src/services/createMockObjectState";
import { describe, expect, test } from "vitest";

describe(createMockObjectState, () => {
  // The runtime rolls a synchronous transaction back when its closure throws, so a write the closure made before it threw
  // Lands nowhere, and the next statement reads the rows as they were before the transaction
  test("transactionSync rolls back the writes of a closure that throws", () => {
    expect.hasAssertions();

    const state = createMockObjectState("room");
    state.database.exec("create table counter (value integer)");

    expect(() =>
      state.ctx.storage.transactionSync(() => {
        state.ctx.storage.sql.exec("insert into counter (value) values (1)");
        throw new Error("a");
      }),
    ).toThrowErrorMatchingInlineSnapshot(`[Error: a]`);

    expect(state.ctx.storage.sql.exec("select value from counter").toArray()).toStrictEqual([]);
  });
});
