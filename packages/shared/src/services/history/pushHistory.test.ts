import { createHistory } from "#src/services/history/createHistory";
import { pushHistory } from "#src/services/history/pushHistory";
import { undoHistory } from "#src/services/history/undoHistory";
import { describe, expect, test } from "vitest";

describe(pushHistory, () => {
  test("a new edit after undo", () => {
    expect.hasAssertions();

    const { history: undoneHistory } = undoHistory(pushHistory(createHistory<string>(2), "a"));

    expect(undoneHistory.future).toStrictEqual(["a"]);
    expect(pushHistory(undoneHistory, "b")).toStrictEqual({ future: [], limit: 2, past: ["b"] });
  });

  test("the bound is reached", () => {
    expect.hasAssertions();

    const fullHistory = pushHistory(pushHistory(createHistory<string>(2), "a"), "b");

    expect(pushHistory(fullHistory, "c").past).toStrictEqual(["b", "c"]);
  });
});
