import { createHistory } from "#src/services/history/createHistory";
import { pushHistory } from "#src/services/history/pushHistory";
import { undoHistory } from "#src/services/history/undoHistory";
import { describe, expect, test } from "vitest";

describe(undoHistory, () => {
  test("undo order", () => {
    expect.hasAssertions();

    const history = pushHistory(pushHistory(createHistory<string>(2), "a"), "b");
    const firstUndo = undoHistory(history);
    const secondUndo = undoHistory(firstUndo.history);

    expect([firstUndo.entry, secondUndo.entry]).toStrictEqual(["b", "a"]);
  });
});
