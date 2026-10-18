import { createHistory } from "#src/services/createHistory";
import { pushHistory } from "#src/services/pushHistory";
import { redoHistory } from "#src/services/redoHistory";
import { undoHistory } from "#src/services/undoHistory";
import { describe, expect, test } from "vitest";

describe(pushHistory, () => {
  test("undo and redo order", () => {
    expect.hasAssertions();

    const history = pushHistory(pushHistory(createHistory<string>(2), "a"), "b");
    const firstUndo = undoHistory(history);
    const secondUndo = undoHistory(firstUndo.history);
    const firstRedo = redoHistory(secondUndo.history);
    const secondRedo = redoHistory(firstRedo.history);

    expect([firstUndo.entry, secondUndo.entry]).toStrictEqual(["b", "a"]);
    expect([firstRedo.entry, secondRedo.entry]).toStrictEqual(["a", "b"]);
    expect(secondRedo.history).toStrictEqual(history);
  });

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
